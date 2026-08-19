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

const EVENT_NAME_RE = /^[a-z][a-z0-9_]{0,39}$/;
const EVENT_KEY_RE = /^[a-z][a-z0-9_]{0,39}$/;
const EVENT_MAX_KEYS = 12;
const EVENT_MAX_VALUE = 120;

/**
 * An event is a name and a handful of small labels. The 120-character ceiling
 * on a value is not formatting — it is where the storage rule is enforced. A
 * pasted contract cannot fit through it even if some future caller passes one
 * by accident, and anything over the ceiling is dropped rather than shortened:
 * a truncated contract is still a stored contract.
 *
 * Unknown keys and unusable values are dropped silently. The alternative is an
 * error the browser cannot act on — `sendBeacon` has nowhere to put a reply.
 */
export function cleanEvent(input) {
  const name = String(input?.name ?? '').trim();
  if (!EVENT_NAME_RE.test(name)) return { ok: false };

  const params = {};
  const raw = input?.params;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const key of Object.keys(raw).slice(0, EVENT_MAX_KEYS)) {
      if (!EVENT_KEY_RE.test(key)) continue;
      const value = raw[key];
      if (typeof value === 'boolean') params[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) params[key] = value;
      else if (typeof value === 'string' && value.length > 0 && value.length <= EVENT_MAX_VALUE) {
        params[key] = value;
      }
    }
  }

  return { ok: true, name, params, path: pageViewPath(String(input?.path ?? '')) };
}

const ASSET_RE = /\.(?:css|js|mjs|png|jpe?g|svg|ico|txt|xml|json|webmanifest|woff2?|map)$/i;

/**
 * Which paths count as a page. Assets are excluded because a page view is meant
 * to be the denominator of the funnel, and counting `styles.css` alongside `/`
 * would quietly inflate it. Returns null for anything that is not a page.
 */
export function pageViewPath(path) {
  if (!path.startsWith('/') || path.length > 120) return null;
  if (path.startsWith('/api/') || path === '/healthz') return null;
  if (ASSET_RE.test(path)) return null;
  return path;
}
