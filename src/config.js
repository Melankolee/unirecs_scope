import 'dotenv/config';

function int(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function num(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: int('PORT', 3000),
  cookieSecure: process.env.COOKIE_SECURE === '1',

  databaseUrl: process.env.DATABASE_URL,

  model: process.env.OPENAI_MODEL || 'gpt-5.5',
  // Empty = leave the parameter off entirely, which is what non-reasoning
  // models need. Set it only once the model is known to accept it.
  reasoningEffort: process.env.OPENAI_REASONING_EFFORT || '',
  llmTimeoutMs: int('LLM_TIMEOUT_MS', 30000),
  // Empty = straight to the provider. Anything else puts a third party in the
  // path of every pasted contract — see the privacy promise in §7.
  baseUrl: process.env.OPENAI_BASE_URL || '',

  dailyCheckCap: int('DAILY_CHECK_CAP', 300),
  // Deliberately null until someone fills in the real tariff. A wrong default
  // here doesn't produce a wrong number in one log line — it produces a wrong
  // cost-per-check figure in the launch report.
  priceInputPerMTok: num('PRICE_INPUT_PER_MTOK', null),
  priceOutputPerMTok: num('PRICE_OUTPUT_PER_MTOK', null),
  // Proxies commonly bill in their own currency, so the unit travels with the
  // number instead of being assumed to be dollars.
  priceCurrency: process.env.PRICE_CURRENCY || 'RUB',

  // The price is a business decision, not a layout constant — it is served to
  // the client from here so changing it never means touching markup.
  plan: {
    price: process.env.PLAN_PRICE || '$19',
    period: process.env.PLAN_PERIOD || 'month',
  },

  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID || '',

  limits: {
    scopeMin: 200,
    scopeMax: 15000,
    requestMin: 20,
    requestMax: 3000,
  },
};

export function assertConfig() {
  const missing = [];
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
