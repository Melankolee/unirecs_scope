/**
 * Runs the prompt over fixtures/cases.json and prints what came back.
 *
 * Spec §9 puts this first: the prompt and the response shape get exercised on
 * real cases before any of the product is built, and again (15-20 cases) before
 * launch. Add cases to the fixture file as you find ones that trip it up.
 *
 *   node scripts/try-prompt.js              # all cases
 *   node scripts/try-prompt.js 3            # just case 3
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { checkScope } from '../src/llm.js';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set.');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const all = JSON.parse(readFileSync(join(root, 'fixtures', 'cases.json'), 'utf8'));

const only = process.argv[2] ? Number.parseInt(process.argv[2], 10) : null;
const cases = only ? [all[only - 1]] : all;

console.log(`model: ${config.model}   endpoint: ${config.baseUrl || 'api.openai.com'}   cases: ${cases.length}\n`);

let matched = 0;
let totalCost = 0;

for (const [i, c] of cases.entries()) {
  const n = only || i + 1;
  process.stdout.write(`[${n}] ${c.name}\n`);

  try {
    const { verdict, meta } = await checkScope({ scope: c.scope, request: c.request });
    const hit = verdict.verdict === c.expect;
    if (hit) matched += 1;
    totalCost += meta.cost || 0;

    console.log(`    ${hit ? 'ok  ' : 'MISS'} expected ${c.expect}, got ${verdict.verdict} (${verdict.confidence})`);
    console.log(`    reasoning: ${verdict.reasoning}`);
    console.log(`    evidence:  ${verdict.evidence ?? '(none)'}`);
    console.log(`    reply:     ${verdict.reply.replace(/\n+/g, ' ')}`);
    if (verdict.change_order) {
      console.log(`    change:    ${verdict.change_order.summary}`);
      console.log(`    terms:     ${verdict.change_order.suggested_terms}`);
    }
    var price = meta.cost === null ? 'cost n/a (set PRICE_*_PER_MTOK)' : `${meta.cost.toFixed(4)} ${config.priceCurrency}`;
    console.log(`    ${meta.latencyMs} ms · ${price} · ${meta.inputTokens}→${meta.outputTokens} tok\n`);
  } catch (err) {
    console.log(`    ERROR ${err.message}\n`);
  }
}

console.log(`${matched}/${cases.length} matched the expected verdict · ${totalCost.toFixed(4)} ${config.priceCurrency} total`);
