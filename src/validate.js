import { config } from './config.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Not exhaustive and not meant to be — it keeps the obvious throwaways out of a
// list we are going to email later.
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  'mailinator.com',
  'maildrop.cc',
  'yopmail.com',
  'temp-mail.org',
  'tempmail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'mintemail.com',
  'moakt.com',
  'emailondeck.com',
  'spamgourmet.com',
  'mailnesia.com',
  'inboxbear.com',
]);

export function validateEmail(raw) {
  const email = String(raw ?? '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Enter your email address.' };
  if (email.length > 254) return { ok: false, error: 'That email address is too long.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "That doesn't look like an email address." };

  const domain = email.slice(email.lastIndexOf('@') + 1);
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, error: 'Please use an address you actually read.' };
  }
  return { ok: true, email };
}

/**
 * Length and non-emptiness only. We deliberately do not try to detect whether
 * the text "looks like a contract" — that call belongs to the person pasting it.
 */
export function validateInputs({ scope, request }) {
  const s = String(scope ?? '').trim();
  const r = String(request ?? '').trim();
  const { scopeMin, scopeMax, requestMin, requestMax } = config.limits;

  if (s.length < scopeMin) {
    return { ok: false, field: 'scope', error: `Add a bit more — at least ${scopeMin} characters of the agreed terms.` };
  }
  if (s.length > scopeMax) {
    return { ok: false, field: 'scope', error: `That's over the ${scopeMax.toLocaleString('en-US')} character limit. Paste the parts that define the work.` };
  }
  if (r.length < requestMin) {
    return { ok: false, field: 'request', error: `Add a bit more — at least ${requestMin} characters of the client's message.` };
  }
  if (r.length > requestMax) {
    return { ok: false, field: 'request', error: `That's over the ${requestMax.toLocaleString('en-US')} character limit.` };
  }
  return { ok: true, scope: s, request: r };
}

const MARK_KEYS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term'];

export function cleanMarks(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of MARK_KEYS) {
    const value = input[key];
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim().slice(0, 255);
    }
  }
  return out;
}
