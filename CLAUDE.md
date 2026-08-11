# Working in this repo

Scope Creep Guard — a one-mechanic demand test. Read
[`docs/scopeguard-mvp-spec.md`](docs/scopeguard-mvp-spec.md) before changing
behaviour; it is the source of truth and it says what deliberately isn't here.

## Commands

```sh
npm run dev          # local server with --watch
npm run migrate      # apply sql/*.sql in order
npm run prompt:try   # run the prompt against fixtures/cases.json
```

## Rules that aren't obvious from the code

**Never let `scope` or `request` reach storage.** Not the database, not the logs,
not an error report. The landing page promises this and the promise is part of
the product — people are pasting client contracts. Only lengths are kept.

**The email gate stays before the verdict.** An address given for value already
received measures something other than what this test measures. Don't "improve"
the flow by moving it.

**`unclear` is a verdict, not a fallback.** If the terms are silent on a request,
the answer is `unclear` — never `out_of_scope`. A tool that refuses everything
gets one send and then gets abandoned.

**Two invariants are enforced in code, not left to the model** (`src/llm.js`,
`normalise`): `change_order` exists only for `out_of_scope`, and `high`
confidence requires a quotable `evidence`. Keep them there.

**No build step.** `public/` is served as-is. If a change needs bundling,
transpiling, or a framework, it is out of scope for this MVP.

**The price lives in config**, never in markup — it is still being agreed.

## If the schedule slips

The spec's cut order: `change_order` first, the price screen second. The verdict
and the reply are never cut — without them there is nothing to measure.
