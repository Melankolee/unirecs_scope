# Signalens

A freelancer pastes the terms they agreed to and the message their client just
sent. They get back a verdict — in scope, out of scope, or genuinely unclear —
the line it rests on, and a reply they can send as it is.

This is a demand test, not a product. One mechanic, no accounts, no billing.
The spec it is built to is [`docs/scopeguard-mvp-spec.md`](docs/scopeguard-mvp-spec.md),
and the look is described in [`docs/DESIGN.md`](docs/DESIGN.md).

The product was called Scope Creep Guard until August 2026. The old name survives
in the places where it is only an identifier — the systemd unit, `/srv/scopeguard`,
the `sg_vid` cookie, the `product` field on analytics events — because renaming
those splits the reports and buys nothing.

## Running it locally

```sh
npm install
cp .env.example .env        # fill in DATABASE_URL and OPENAI_API_KEY
createdb scopeguard         # or point DATABASE_URL at an existing database
npm run migrate
npm run dev                 # http://localhost:3000
```

Exercise the prompt on its own, without the product around it:

```sh
npm run prompt:try          # runs every case in fixtures/cases.json
node scripts/try-prompt.js 3   # just case 3
```

Add cases to `fixtures/cases.json` whenever you find one the prompt gets wrong.
The spec calls for 15–20 before launch; five ship in the repo.

## How it fits together

| Path | What it is |
|---|---|
| `src/prompt.js` | System prompt and the JSON schema the verdict must match |
| `src/llm.js` | The single model call: structured output, 30s timeout, one retry, cost logging |
| `src/routes/api.js` | `/api/lead`, `/api/access`, `/api/check`, `/api/event`, `/api/config` |
| `src/db.js` | The one table, plus the one-check-per-visitor rule |
| `public/` | Landing, tool, privacy, terms — no build step |
| `public/js/i18n.js` | EN/RU strings and the header switcher |
| `public/js/attach.js` | Turns an attached `.docx`/`.txt`/`.md` into text, in the browser, without a library |
| `fixtures/cases.json` | Prompt regression cases |
| `deploy/` | systemd unit, nginx config, nightly dump |

The whole front end is plain HTML, CSS, and ES5-flavoured JS served statically.
There is nothing to compile. One thing does come from outside: the Satoshi
webfont, imported from `api.fontshare.com` at the top of `styles.css`. It has a
system fallback, so a blocked CDN costs the page its typeface and nothing else.

## The privacy promise is load-bearing

`privacy.html` says the pasted text is not stored. The rest of the interface
deliberately stays quiet about it (spec §0), which changes nothing here — the
promise is still made, and it has to stay true:

- `scope` and `request` never reach the database — only their lengths do
- neither reaches the logs; `src/routes/api.js` logs lengths and verdicts only
- `sql/001_init.sql` has no column that could hold them
- an attached file is opened in the browser and never uploaded — `public/js/attach.js`
  sends nothing; only the extracted text goes into the field, and the file name
  goes nowhere at all

If you add a log line, a debug dump, or an error report, check that the text
isn't riding along inside it.

## Deploying

Ubuntu VPS, Node 20+, Postgres, nginx in front for TLS.

```sh
# on the server, as root
adduser --system --group --home /srv/scopeguard scopeguard
# deploy the code to /srv/scopeguard, then:
sudo -u scopeguard npm ci --omit=dev
sudo -u scopeguard npm run migrate

cp deploy/scopeguard.service /etc/systemd/system/
systemctl enable --now scopeguard

cp deploy/nginx.conf /etc/nginx/sites-available/scopeguard
ln -s /etc/nginx/sites-available/scopeguard /etc/nginx/sites-enabled/
certbot --nginx -d scopeguard.example.com
```

The `.env` is written on the server and never deployed from a laptop:

```sh
sudo -u scopeguard cp .env.example .env
sudo -u scopeguard chmod 600 .env        # it holds the API key
sudo -u scopeguard mkdir -p dumps        # systemd's ReadWritePaths expects it
```

Production differs from local in five values: `NODE_ENV=production`,
`COOKIE_SECURE=1`, a real `DATABASE_URL`, a fresh `OPENAI_API_KEY`, and the
`PRICE_*_PER_MTOK` tariff.

Add the nightly dump to cron:

```
15 3 * * * . /srv/scopeguard/.env && /srv/scopeguard/deploy/dump.sh >> /var/log/scopeguard-dump.log 2>&1
```

## Before the first deploy

- [ ] Run `npm run migrate` and walk the whole flow against a real Postgres —
      the database path is the least exercised part of this repo
- [ ] Fill all eleven `[PLACEHOLDER]` spots in `public/privacy.html` and
      `public/terms.html`, and have both read by someone qualified
- [ ] Decide whether the API proxy stays in production. If it does, name it in
      the privacy notice as a second processor; if not, delete that block and
      point `OPENAI_BASE_URL` at the provider directly
- [ ] Issue a fresh API key for the server, and set a hard spend cap on it
- [ ] Point the DNS at the box and run certbot before the first real visitor

## Before the ads run

- [ ] Set `DAILY_CHECK_CAP` to a number of checks you're willing to lose in a day
- [ ] Fill `PRICE_*_PER_MTOK` from your provider's tariff, so the cost figures in
      the logs are real
- [ ] Confirm the price in `PLAN_PRICE` with the client
- [ ] Set `GA4_MEASUREMENT_ID`, then import `email_submit` and `verdict_shown`
      into Google Ads as conversions
- [ ] Run 15–20 prompt cases and fix what they surface
- [ ] Confirm the nightly dump actually produced a file
