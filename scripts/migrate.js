import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertConfig } from '../src/config.js';
import { pool } from '../src/db.js';

assertConfig();

const sqlDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'sql');
const files = readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  const sql = readFileSync(join(sqlDir, file), 'utf8');
  await pool.query(sql);
  console.log(`applied ${file}`);
}

await pool.end();
