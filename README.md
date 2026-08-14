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
| `deploy/` | systemd unit, nginx config, deploy script, nightly dump |
| `.github/workflows/deploy.yml` | Push to `main` → SSH → `deploy/deploy.sh` |

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

Production is `scopeguard.anytoolai.store` — an Ubuntu 24.04 VPS running Node 20,
Postgres 16 and nginx, with the app in `/srv/scopeguard` under a system user of
the same name. The box also serves an unrelated site, which is why the nginx
config avoids touching anything it did not create.

Every push to `main` deploys itself: `.github/workflows/deploy.yml` opens an SSH
session and runs `deploy/deploy.sh` with the pushed commit. The script is the
whole deploy — fetch, `npm ci --omit=dev`, `npm run migrate`, restart, then poll
`/healthz` and put the previous commit back if it never answers. Nothing about
it needs CI: the same line run by hand does the same thing, which matters on the
day GitHub is the thing that's down.

```sh
sudo -u scopeguard /srv/scopeguard/deploy/deploy.sh          # latest origin/main
sudo -u scopeguard /srv/scopeguard/deploy/deploy.sh <sha>    # a specific commit
```

CI runs the `deploy.sh` already on the server, which then checks out the pushed
commit — so a change to the script itself takes effect on the *next* deploy.
Run it by hand once when that matters.

The rollback restores code, not schema. Migrations here only add things
(`sql/*.sql`, all `IF NOT EXISTS`), so the older revision runs happily against
the newer schema. A migration that drops or renames a column breaks that and
needs its own plan.

CI reaches the box as `scopeguard`, not root: a key in `~scopeguard/.ssh/`, and
`/etc/sudoers.d/scopeguard` granting exactly `systemctl restart|is-active|status
scopeguard`. Four repository secrets drive it:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | the server's IP |
| `DEPLOY_USER` | `scopeguard` |
| `DEPLOY_KEY` | private half of the CI key |
| `DEPLOY_HOST_KEY` | `ssh-keyscan -t ed25519 <ip>`, so the runner can't be pointed elsewhere |

Setting the box up from nothing:

```sh
# on the server, as root
adduser --system --group --home /srv/scopeguard scopeguard
usermod -s /bin/bash scopeguard          # the deploy session needs a shell
# deploy the code to /srv/scopeguard, then:
sudo -u scopeguard npm ci --omit=dev
sudo -u scopeguard npm run migrate

cp deploy/scopeguard.service /etc/systemd/system/
systemctl enable --now scopeguard

certbot certonly --nginx -d scopeguard.anytoolai.store   # cert first, see nginx.conf
cp deploy/nginx.conf /etc/nginx/sites-available/scopeguard
ln -s /etc/nginx/sites-available/scopeguard /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

`/srv/scopeguard` is both the checkout and the deploy user's home, so `.env`,
`dumps/` and `.ssh/authorized_keys` sit untracked inside it. That is why the
deploy script resets but never cleans — a `git clean -fd` there locks the next
deploy out of the server.

The `.env` is written on the server and never deployed from a laptop:

```sh
sudo -u scopeguard cp .env.example .env
sudo -u scopeguard chmod 600 .env        # it holds the API key
sudo -u scopeguard mkdir -p dumps        # systemd's ReadWritePaths expects it
```

Production differs from local in five values: `NODE_ENV=production`,
`COOKIE_SECURE=1`, a real `DATABASE_URL`, a fresh `OPENAI_API_KEY`, and the
`PRICE_*_PER_MTOK` tariff.

The nightly dump runs from `/etc/cron.d/scopeguard`:

```
SHELL=/bin/bash
15 3 * * * scopeguard set -a; . /srv/scopeguard/.env; set +a; /srv/scopeguard/deploy/dump.sh >> /var/log/scopeguard-dump.log 2>&1
```

`set -a` is not decoration. A bare `. .env` defines shell variables without
exporting them, so `dump.sh` — a separate process — starts with no
`DATABASE_URL` and refuses to run.

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
