# Working in this repo

Signalens — a one-mechanic demand test. Read
[`docs/scopeguard-mvp-spec.md`](docs/scopeguard-mvp-spec.md) before changing
behaviour; it is the source of truth and it says what deliberately isn't here.
Its §0 records where the shipped product knowingly departs from the rest of it.

The name only changed on the surface. `scopeguard` still names the systemd unit,
the deploy paths, the `sg_vid` cookie, and the `product` field on every analytics
event — those are keys, and renaming them buys nothing and splits the reports.

## Commands

```sh
npm run dev          # local server with --watch
npm run migrate      # apply sql/*.sql in order
npm run prompt:try   # run the prompt against fixtures/cases.json
```

## Rules that aren't obvious from the code

**Never let `scope` or `request` reach storage.** Not the database, not the logs,
not an error report. Only lengths are kept. That extends to the paperclip on
screen 1: `public/js/attach.js` opens the file in the browser, only the text it
yields goes anywhere, and the file name is shown back but never sent — not to the
server, not into an analytics event. The interface no longer says so
anywhere except `privacy.html` — that was a deliberate call (spec §0: a page that
answers "is this dangerous?" up front asks the question for you). The rule does
not depend on the copy: the privacy notice still promises it, and people are
pasting client contracts.

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

**English lives in the markup; `js/i18n.js` only overrides it.** That keeps every
page readable before the script runs and without JavaScript at all. Anything
built from JS must re-render through `SG.onLang`, or a language switch leaves
half the screen behind. The legal pages stay English on purpose.

**`docs/DESIGN.md` describes what is actually in `public/styles.css`.** Change one
and change the other, or it becomes fiction.

## If the schedule slips

The spec's cut order: `change_order` first, the price screen second. The verdict
and the reply are never cut — without them there is nothing to measure.
