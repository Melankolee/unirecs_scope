import { config } from './config.js';

/**
 * Where the cookie banner is shown.
 *
 * Consent is asked in the places whose law requires asking, and granted
 * automatically everywhere else. That is a decision about where we are made to
 * ask, not about who deserves the choice, and it is worth writing down plainly
 * rather than leaving the reader to infer it from a country list.
 *
 * Every failure path returns "ask" — no lookup configured, provider down,
 * timeout, private address, an answer we cannot parse. A banner shown to
 * someone who did not need one costs a click; the reverse costs a complaint.
 */
const ASK_FIRST = new Set([
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA beyond the EU
  'IS', 'LI', 'NO',
  // UK, and the Crown Dependencies, which run their own GDPR-shaped laws
  'GB', 'JE', 'GG', 'IM',
  // Switzerland: the FADP is softer than GDPR, but one line is cheaper than
  // the argument about whether it is softer enough.
  'CH',
]);

const TTL_MS = 12 * 60 * 60 * 1000;
const MISS_TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 20_000;

const cache = new Map();

/* Loopback, private ranges and the IPv6 forms of both. A developer on a laptop
   and a health check from the host are not visitors, and asking a paid lookup
   about 127.0.0.1 wastes a request to be told nothing. */
function isLocal(ip) {
  return /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(ip)
    || ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd');
}

/* Providers disagree about the field name and some answer with a bare code, so
   take the first thing that looks like one rather than binding to one vendor. */
function parseCountry(text) {
  const body = text.trim();
  if (/^[A-Za-z]{2}$/.test(body)) return body.toUpperCase();

  let data;
  try { data = JSON.parse(body); } catch { return null; }
  for (const key of ['country_code', 'countryCode', 'country']) {
    const value = data?.[key];
    if (typeof value === 'string' && /^[A-Za-z]{2}$/.test(value)) return value.toUpperCase();
  }
  return null;
}

async function lookup(ip) {
  const url = config.geoApiUrl.replace('{ip}', encodeURIComponent(ip));
  const abort = AbortSignal.timeout(config.geoTimeoutMs);
  const res = await fetch(url, { signal: abort, headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  return parseCountry(await res.text());
}

async function countryOf(ip) {
  if (!config.geoApiUrl || !ip || isLocal(ip)) return null;

  const hit = cache.get(ip);
  if (hit && Date.now() < hit.until) return hit.country;

  let country = null;
  try {
    country = await lookup(ip);
  } catch (err) {
    // A provider that is slow or down must not become a slow or down site.
    console.error(JSON.stringify({ level: 'warn', at: 'geo', message: err.message || err.code || String(err) }));
  }

  // The cache is cleared rather than evicted one by one: this is a demand test,
  // not a CDN, and a rebuilt cache costs a handful of lookups.
  if (cache.size >= MAX_ENTRIES) cache.clear();
  cache.set(ip, { country, until: Date.now() + (country ? TTL_MS : MISS_TTL_MS) });

  return country;
}

export async function consentRequired(ip) {
  const country = await countryOf(ip);
  return country === null ? true : ASK_FIRST.has(country);
}
