import { Router } from 'express';
import { config } from '../config.js';
import { consentRequired } from '../geo.js';
import { checkScope, LlmError } from '../llm.js';
import { rateLimit } from '../rateLimit.js';
import { cleanEvent, cleanMarks, validateEmail, validateInputs } from '../validate.js';
import { VISITOR_COOKIE, visitorId } from '../visitor.js';
import {
  checksToday,
  checksUsed,
  insertEvent,
  insertLead,
  leadBelongsToVisitor,
  markFlag,
  saveVerdict,
} from '../db.js';

export const api = Router();

function log(fields) {
  // Structured, one line, and never carrying `scope` or `request` — the landing
  // page promises the texts are not kept, and logs are part of that promise.
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}

/**
 * `consentRequired` is decided here rather than in the browser because the
 * browser cannot be trusted to know where it is and, more to the point, the
 * answer must not be something a visitor can flip. The page already waits for
 * this response before starting analytics, so it costs no extra round trip.
 */
api.get('/config', async (req, res) => {
  res.json({
    plan: config.plan,
    ga4MeasurementId: config.ga4MeasurementId,
    limits: config.limits,
    consentRequired: await consentRequired(req.ip),
  });
});

/**
 * The email gate. Deliberately before the verdict: an address given for value
 * already received measures something other than what we want to measure.
 */
api.post('/lead', rateLimit({ name: 'lead', max: 8 }), async (req, res) => {
  const vid = visitorId(req, res);
  const { ok, email, error } = validateEmail(req.body?.email);
  if (!ok) return res.status(400).json({ error });

  try {
    const used = await checksUsed({ email, visitorId: vid });
    if (used >= config.freeChecks) {
      log({ level: 'info', at: 'lead', outcome: 'limited', used });
      return res.json({ limited: true });
    }

    const leadId = await insertLead({ email, visitorId: vid, marks: cleanMarks(req.body?.marks) });
    log({ level: 'info', at: 'lead', outcome: 'created', leadId });
    return res.json({ leadId, limited: false });
  } catch (err) {
    log({ level: 'error', at: 'lead', message: err.message });
    return res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
  }
});

/**
 * The landing page's "Get access" form. The same address, a different question:
 * these people asked before being shown anything, so the row is marked
 * `source: 'access'` and stays out of the gate's numbers. No verdict is ever
 * written against it, which is also why it does not spend the free check.
 */
api.post('/access', rateLimit({ name: 'access', max: 8 }), async (req, res) => {
  const vid = visitorId(req, res);
  const { ok, email, error } = validateEmail(req.body?.email);
  if (!ok) return res.status(400).json({ error });

  try {
    const leadId = await insertLead({
      email,
      visitorId: vid,
      marks: cleanMarks(req.body?.marks),
      source: 'access',
    });
    log({ level: 'info', at: 'access', outcome: 'created', leadId });
    return res.json({ ok: true });
  } catch (err) {
    log({ level: 'error', at: 'access', message: err.message });
    return res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
  }
});

api.post('/check', rateLimit({ name: 'check', max: 5 }), async (req, res) => {
  const vid = req.cookies?.[VISITOR_COOKIE];
  const leadId = Number.parseInt(req.body?.leadId, 10);

  if (!Number.isFinite(leadId) || !(await leadBelongsToVisitor(leadId, vid))) {
    return res.status(403).json({ error: 'Session expired. Reload the page and start again.' });
  }

  const input = validateInputs({ scope: req.body?.scope, request: req.body?.request });
  if (!input.ok) return res.status(400).json({ error: input.error, field: input.field });

  const scopeLen = input.scope.length;
  const requestLen = input.request.length;

  try {
    if (config.dailyCheckCap > 0 && (await checksToday()) >= config.dailyCheckCap) {
      log({ level: 'warn', at: 'check', outcome: 'daily_cap' });
      return res.status(503).json({
        error: "We've hit today's capacity. Try again tomorrow — nothing you pasted was stored.",
      });
    }

    const { verdict, meta } = await checkScope({ scope: input.scope, request: input.request });
    await saveVerdict(leadId, {
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      scopeLen,
      requestLen,
    });

    log({
      level: 'info',
      at: 'check',
      outcome: 'ok',
      leadId,
      scopeLen,
      requestLen,
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      latencyMs: meta.latencyMs,
      cost: meta.cost,
      currency: meta.cost === null ? null : config.priceCurrency,
      inputTokens: meta.inputTokens,
      outputTokens: meta.outputTokens,
    });

    return res.json({ verdict });
  } catch (err) {
    const isLlm = err instanceof LlmError;
    log({
      level: 'error',
      at: 'check',
      outcome: isLlm ? 'llm_error' : 'server_error',
      leadId,
      scopeLen,
      requestLen,
      message: err.message,
    });
    return res.status(isLlm ? 502 : 500).json({
      error: "The check didn't come back. Nothing you pasted was stored — try once more.",
    });
  }
});

/**
 * The first-party event sink. Every visitor, every event, regardless of the
 * cookie banner: the row is written here, on our side, from a request the
 * browser was making anyway, and nothing is stored on the visitor's device to
 * make it work. The banner governs GA4, which does write to the device and does
 * hand the data to Google.
 *
 * `/event` next door is a different thing and older — it flips a flag on a lead.
 * This one takes named events with small parameters and keeps them all.
 *
 * Answers 204 to everything, including rubbish: `sendBeacon` fires into a page
 * that may already be gone, so there is nobody left to read an error.
 */
api.post('/track', rateLimit({ name: 'track', max: 240 }), async (req, res) => {
  const vid = visitorId(req, res);
  const event = cleanEvent(req.body);
  if (!event.ok) return res.status(204).end();

  try {
    await insertEvent({
      name: event.name,
      visitorId: vid,
      path: event.path,
      params: event.params,
    });
  } catch (err) {
    log({ level: 'error', at: 'track', name: event.name, message: err.message || err.code || String(err) });
  }
  return res.status(204).end();
});

api.post('/event', rateLimit({ name: 'event', max: 30 }), async (req, res) => {
  const vid = req.cookies?.[VISITOR_COOKIE];
  const leadId = Number.parseInt(req.body?.leadId, 10);
  const type = req.body?.type;

  if (!['reply_copied', 'price_cta'].includes(type)) {
    return res.status(400).json({ error: 'Unknown event.' });
  }
  if (!Number.isFinite(leadId) || !(await leadBelongsToVisitor(leadId, vid))) {
    return res.status(204).end();
  }

  try {
    await markFlag(leadId, type);
  } catch (err) {
    log({ level: 'error', at: 'event', type, message: err.message });
  }
  return res.status(204).end();
});
