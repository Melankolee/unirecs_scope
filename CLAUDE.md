# Working in this repo

Mailtrick — a one-mechanic demand test. Read
[`docs/scopeguard-mvp-spec.md`](docs/scopeguard-mvp-spec.md) before changing
behaviour; it is the source of truth and it says what deliberately isn't here.
Its §0 records where the shipped product knowingly departs from the rest of it.

The name only changed on the surface. `scopeguard` still names the systemd unit,
the deploy paths, the `sg_vid` cookie, and the `product` field on every analytics
event — those are keys, and renaming them buys nothing and splits the reports.

## Commands

```sh
npm run dev           # local server with --watch
npm run migrate       # apply sql/*.sql in order
npm run prompt:try    # run the prompt against fixtures/cases.json
npm run report:emails # checks per address, read out of the database
```

## Rules that aren't obvious from the code

**Never let `scope` or `request` reach storage.** Not the database, not the logs,
not an error report. Only lengths are kept. That extends to the paperclip on
screen 1: `public/js/attach.js` opens the file in the browser, only the text it
yields goes anywhere, and the file name is shown back but never sent — not to the
server, not into an analytics event. The interface says so in exactly two places
— the footer line "We never store the text you paste" and `privacy.html`.
Everywhere else it stays unsaid, and that is a deliberate call (spec §0: a page
that answers "is this dangerous?" up front asks the question for you). The rule
does not depend on the copy: the privacy notice still promises it, and people are
pasting client contracts.

**Two analytics channels, and they answer to different rules.** `/api/track`
writes every event to `events_scopeguard` for every visitor, always: nothing is
stored on the device to make it work, so the cookie banner has no say in it, and
this is the channel the funnel is read from. GA4 is the other one, it is what
the banner governs, and it is shown only where the law requires asking — the
server decides that in `/api/config` (`geo.js`), never the browser. A stored
`sg_consent = denied` wins over automatic consent everywhere. Two things stay
out of scope by decision, not by oversight: no opt-out control outside the
regions that get the banner, and no defeating a refusal that already exists —
no proxying GTM through our own domain, no re-setting cookies server-side to
beat ITP.

**Whatever a page says, the code must already do.** `privacy.html` is not
decoration — it promised for a while that declining stopped analytics events,
which stopped being true the day `/api/track` shipped. Change behaviour, change
that page in the same commit.

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

**The site is English, and the copy lives in the markup.** That keeps every page
readable before the script runs and without JavaScript at all. `js/strings.js`
holds only what markup cannot: text assembled from numbers, verdict labels that
depend on an answer, errors for things that have not happened yet. If a string
has a home in the HTML, it belongs there and not in that file.

There was an EN/RU switch; it was removed on request (spec §0), together with
the pass that rewrote the markup and every `data-i18n` attribute that fed it.
Re-adding a language means re-adding both — the git history has them.

**`docs/DESIGN.md` describes what is actually in `public/styles.css`.** Change one
and change the other, or it becomes fiction.

## If the schedule slips

The spec's cut order: `change_order` first, the price screen second. The verdict
and the reply are never cut — without them there is nothing to measure.
