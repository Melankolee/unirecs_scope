/**
 * How many checks each address has spent.
 *
 * Nothing new is collected to make this work — every check already writes a row
 * with the address and the verdict, so the whole history counts, including what
 * was gathered before this script existed. Reading is all it does.
 *
 * Addresses are the point of the report, so they are printed; the pasted texts
 * are not in the table to print. Send the output nowhere the address list
 * shouldn't go.
 */
import { config } from '../src/config.js';
import { checksPerEmail, pool } from '../src/db.js';

// Not `assertConfig` on purpose: reading the table needs a database and not an
// API key, and the report should run from a laptop that has only the former.
if (!config.databaseUrl) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const rows = await checksPerEmail();

if (rows.length === 0) {
  console.log('No completed checks yet.');
} else {
  const checks = rows.reduce((n, r) => n + r.checks, 0);
  const exhausted = rows.filter((r) => r.checks >= config.freeChecks).length;
  const repeat = rows.filter((r) => r.checks > 1).length;

  // The distribution first: one line per "did N checks", which is the shape of
  // the question. The per-address table under it is the same data unrolled.
  const byCount = new Map();
  for (const r of rows) byCount.set(r.checks, (byCount.get(r.checks) || 0) + 1);

  console.log(`${checks} checks from ${rows.length} addresses`);
  console.log(`${repeat} came back for a second, ${exhausted} spent all ${config.freeChecks}\n`);

  console.log('checks  addresses');
  for (const n of [...byCount.keys()].sort((a, b) => a - b)) {
    const addresses = byCount.get(n);
    console.log(`${String(n).padStart(6)}  ${String(addresses).padStart(9)}  ${'#'.repeat(addresses)}`);
  }

  const day = (ts) => ts.toISOString().slice(0, 10);
  const width = Math.max(...rows.map((r) => r.email.length), 5);

  console.log(`\n${'email'.padEnd(width)}  checks  copied  price  first       last`);
  for (const r of rows) {
    console.log(
      [
        r.email.padEnd(width),
        String(r.checks).padStart(6),
        String(r.replies_copied).padStart(6),
        String(r.price_cta).padStart(5),
        day(r.first_at),
        day(r.last_at),
      ].join('  '),
    );
  }
}

await pool.end();
