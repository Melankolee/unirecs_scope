import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error(JSON.stringify({ level: 'error', at: 'pg_pool', message: err.message }));
});

export function query(text, params) {
  return pool.query(text, params);
}

/**
 * How many free checks a visitor has already spent. Counted on the pair
 * (email, cookie) — a lead matching either side and carrying a verdict counts.
 * The allowance itself lives in `config.freeChecks`; the interface never names
 * a number, so changing it is a config change and nothing else.
 * Incognito walks around this, and that is fine: the point is the API budget,
 * not the paywall.
 */
export async function checksUsed({ email, visitorId }) {
  const { rows } = await query(
    `SELECT count(*)::int AS n
       FROM leads_scopeguard
      WHERE verdict IS NOT NULL
        AND (lower(email) = lower($1) OR ($2::text IS NOT NULL AND visitor_id = $2))`,
    [email, visitorId || null],
  );
  return rows[0].n;
}

/**
 * `source` says which form the address came from: 'gate' (before a verdict) or
 * 'access' (the landing page's waitlist). A landing row never gets a verdict,
 * so it is invisible to `checksUsed` above and costs the visitor nothing.
 */
export async function insertLead({ email, visitorId, marks, source = 'gate' }) {
  const { rows } = await query(
    `INSERT INTO leads_scopeguard
       (email, visitor_id, source, gclid, utm_source, utm_medium, utm_campaign, utm_term)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      email,
      visitorId || null,
      source,
      marks.gclid || null,
      marks.utm_source || null,
      marks.utm_medium || null,
      marks.utm_campaign || null,
      marks.utm_term || null,
    ],
  );
  return rows[0].id;
}

export async function saveVerdict(leadId, { verdict, confidence, scopeLen, requestLen }) {
  await query(
    `UPDATE leads_scopeguard
        SET verdict = $2, confidence = $3, scope_len = $4, request_len = $5
      WHERE id = $1`,
    [leadId, verdict, confidence, scopeLen, requestLen],
  );
}

export async function markFlag(leadId, flag) {
  const column = flag === 'reply_copied' ? 'reply_copied' : 'price_cta';
  await query(`UPDATE leads_scopeguard SET ${column} = TRUE WHERE id = $1`, [leadId]);
}

export async function leadBelongsToVisitor(leadId, visitorId) {
  if (!visitorId) return false;
  const { rows } = await query(
    `SELECT 1 FROM leads_scopeguard WHERE id = $1 AND visitor_id = $2 LIMIT 1`,
    [leadId, visitorId],
  );
  return rows.length > 0;
}

export async function checksToday() {
  const { rows } = await query(
    `SELECT count(*)::int AS n
       FROM leads_scopeguard
      WHERE verdict IS NOT NULL
        AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')`,
  );
  return rows[0].n;
}

/**
 * Checks per address, for the report. The `verdict IS NOT NULL` test is the
 * same one `checksUsed` applies, so a row counted here is a row that spent
 * someone's allowance — and landing-page signups (`source: 'access'`, never
 * given a verdict) stay out of the numbers without needing a filter of their
 * own.
 *
 * This is only half of what the gate counts: the allowance is spent on
 * (email OR cookie), so an address that shows 4 here can still be refused a
 * fifth check on a cookie that has been used under another address. Grouping
 * by cookie instead would be the mirror image of the same table.
 */
export async function checksPerEmail() {
  const { rows } = await query(
    `SELECT lower(email)                                AS email,
            count(*)::int                               AS checks,
            (count(*) FILTER (WHERE reply_copied))::int AS replies_copied,
            (count(*) FILTER (WHERE price_cta))::int    AS price_cta,
            min(created_at)                             AS first_at,
            max(created_at)                             AS last_at
       FROM leads_scopeguard
      WHERE verdict IS NOT NULL
      GROUP BY 1
      ORDER BY checks DESC, last_at DESC`,
  );
  return rows;
}
