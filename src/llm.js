import OpenAI from 'openai';
import { config } from './config.js';
import { SYSTEM_PROMPT, VERDICT_SCHEMA, buildUserMessage } from './prompt.js';

// One automatic retry, a hard 30s ceiling per attempt — spec §4.4.
const client = new OpenAI({
  baseURL: config.baseUrl || undefined,
  timeout: config.llmTimeoutMs,
  maxRetries: 1,
});

export class LlmError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'LlmError';
    this.cause = cause;
  }
}

function estimateCost(usage) {
  if (!usage) return null;
  // No tariff configured — report nothing rather than a plausible-looking figure.
  if (config.priceInputPerMTok === null || config.priceOutputPerMTok === null) return null;
  const input = usage.prompt_tokens || 0;
  const output = usage.completion_tokens || 0;
  const cost = (input / 1e6) * config.priceInputPerMTok
    + (output / 1e6) * config.priceOutputPerMTok;
  return Number(cost.toFixed(6));
}

function validateShape(v) {
  if (!v || typeof v !== 'object') return 'not an object';
  if (!['in_scope', 'out_of_scope', 'unclear'].includes(v.verdict)) return 'bad verdict';
  if (!['high', 'medium', 'low'].includes(v.confidence)) return 'bad confidence';
  if (typeof v.reasoning !== 'string' || !v.reasoning.trim()) return 'bad reasoning';
  if (typeof v.reply !== 'string' || !v.reply.trim()) return 'bad reply';
  if (v.evidence !== null && typeof v.evidence !== 'string') return 'bad evidence';
  if (v.change_order !== null && v.change_order !== undefined) {
    if (typeof v.change_order !== 'object') return 'bad change_order';
    if (typeof v.change_order.summary !== 'string') return 'bad change_order.summary';
    if (typeof v.change_order.suggested_terms !== 'string') return 'bad change_order.suggested_terms';
  }
  return null;
}

/**
 * Two invariants the model is asked for but not trusted on, because a broken one
 * is visible to the user rather than merely wrong:
 *  - change_order exists only for out_of_scope (spec §4.2)
 *  - "high" confidence requires something quotable (spec §4.3 rule 5)
 */
function normalise(v) {
  if (v.verdict !== 'out_of_scope') v.change_order = null;
  if (v.change_order === undefined) v.change_order = null;
  // The model sometimes returns the quote already wrapped in quotation marks and
  // sometimes bare; the verdict card adds its own, so strip them here rather
  // than rendering ““like this””.
  if (typeof v.evidence === 'string') {
    v.evidence = v.evidence.trim().replace(/^["'“«]+|["'”»]+$/g, '').trim();
    if (!v.evidence) v.evidence = null;
  }
  if (v.evidence === undefined) v.evidence = null;
  if (v.evidence === null && v.confidence === 'high') v.confidence = 'medium';
  return v;
}

async function callOnce(messages) {
  const params = {
    model: config.model,
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'scope_verdict',
        strict: true,
        schema: VERDICT_SCHEMA,
      },
    },
  };
  if (config.reasoningEffort) params.reasoning_effort = config.reasoningEffort;

  const response = await client.chat.completions.create(params);
  const choice = response.choices?.[0];

  if (!choice) throw new LlmError('model returned no choices');
  if (choice.finish_reason === 'length') {
    throw new LlmError('response truncated before it was complete');
  }
  if (choice.message?.refusal) {
    throw new LlmError(`model refused: ${choice.message.refusal}`);
  }

  return { text: choice.message?.content ?? '', usage: response.usage };
}

export async function checkScope({ scope, request }) {
  const startedAt = Date.now();
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage({ scope, request }) },
  ];

  let lastProblem = null;
  let usage = null;

  // Structured outputs already constrain the shape; the second pass is the
  // spec's "one repeat with a format reminder" for the case where it doesn't.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let text;
    try {
      ({ text, usage } = await callOnce(messages));
    } catch (err) {
      if (err instanceof LlmError) throw err;
      throw new LlmError(err.message || 'model call failed', err);
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      lastProblem = 'response was not valid JSON';
      messages.push(
        { role: 'assistant', content: text },
        {
          role: 'user',
          content:
            'That response could not be parsed. Reply again with the JSON object only — no prose, no code fences, every required field present.',
        },
      );
      continue;
    }

    const problem = validateShape(parsed);
    if (problem) {
      lastProblem = problem;
      messages.push(
        { role: 'assistant', content: text },
        {
          role: 'user',
          content: `That response did not match the required shape (${problem}). Reply again with a valid JSON object only.`,
        },
      );
      continue;
    }

    return {
      verdict: normalise(parsed),
      meta: {
        latencyMs: Date.now() - startedAt,
        cost: estimateCost(usage),
        inputTokens: usage?.prompt_tokens ?? null,
        outputTokens: usage?.completion_tokens ?? null,
      },
    };
  }

  throw new LlmError(`model returned an unusable response (${lastProblem})`);
}
