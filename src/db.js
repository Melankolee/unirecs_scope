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
 * A visitor gets one free check. Enforced on the pair (email, cookie) — either
 * side matching a lead that already produced a verdict closes the door.
 * Incognito walks around this, and that is fine: the point is the API budget,
 * not the paywall.
 */
export async function hasUsedCheck({ email, visitorId }) {
  const { rows } = await query(
    `SELECT 1
       FROM leads_scopeguard
      WHERE verdict IS NOT NULL
        AND (lower(email) = lower($1) OR ($2::text IS NOT NULL AND visitor_id = $2))
      LIMIT 1`,
    [email, visitorId || null],
  );
  return rows.length > 0;
}

export async function insertLead({ email, visitorId, marks }) {
  const { rows } = await query(
    `INSERT INTO leads_scopeguard
       (email, visitor_id, gclid, utm_source, utm_medium, utm_campaign, utm_term)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      email,
      visitorId || null,
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
