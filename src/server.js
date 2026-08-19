import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { assertConfig, config } from './config.js';
import { api } from './routes/api.js';
import { cleanMarks, pageViewPath } from './validate.js';
import { visitorId } from './visitor.js';
import { insertEvent, pool } from './db.js';

assertConfig();

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  next();
});

app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

app.use('/api', api);

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// One page, one URL. `extensions: ['html']` used to answer 200 at both
// /privacy and /privacy.html, and the landing at three addresses; the canonical
// tags named the winner, but only after the crawler had already spent a fetch
// on the loser. Redirecting instead means the duplicate never exists. Read from
// disk at boot so adding a page does not mean remembering to add it here too.
const pages = new Set(
  readdirSync(join(root, 'public'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.slice(0, -'.html'.length)),
);

app.use((req, res, next) => {
  const [path, query] = req.originalUrl.split('?');
  const suffix = query ? `?${query}` : '';

  if (path === '/index' || path === '/index.html') {
    return res.redirect(301, `/${suffix}`);
  }

  const bare = path.slice(1);
  if (bare && !bare.includes('/') && pages.has(bare)) {
    return res.redirect(301, `/${bare}.html${suffix}`);
  }

  next();
});

/**
 * Page views, counted on the server.
 *
 * This is the number the cookie banner could take away, and it is the
 * denominator under every rate below it — without it "40 checks" has nothing to
 * be 40 out of. Counting here also catches the visitor whose browser never ran
 * our JavaScript at all.
 *
 * It sits after the redirects on purpose: /privacy and /privacy.html are one
 * arrival, and counting both would inflate the top of the funnel by exactly the
 * traffic that is best behaved.
 *
 * This is also the first place `sg_vid` is set. Before, the cookie appeared only
 * when an address was submitted, so everything a visitor did before that had
 * nobody to belong to.
 */
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();

  const path = pageViewPath(req.path);
  if (path === null) return next();

  // Ad marks are read straight off the entry URL, so a click that never leaves
  // an address is still attributable — the sessionStorage copy only ever
  // reached us attached to an email.
  insertEvent({
    name: 'page_view',
    visitorId: visitorId(req, res),
    path,
    params: cleanMarks(req.query),
  }).catch((err) => {
    console.error(JSON.stringify({
      // A dead pool throws an AggregateError, whose `.message` is empty — the
      // log line came out blank exactly when it was needed.
      ts: new Date().toISOString(), level: 'error', at: 'page_view', message: err.message || err.code || String(err),
    }));
  });

  next();
});

app.use(express.static(join(root, 'public'), {
  // Nothing here is fingerprinted — there is no build step to do it — so a
  // long max-age is a promise we cannot keep: a deploy would not reach anyone
  // who visited during the window. HTML always revalidates so copy lands at
  // once; css/js get an hour, enough to stop the refetch on every page view
  // and short enough that a fix is never more than an hour from a returning
  // visitor; images and icons change only when they are redrawn.
  setHeaders(res, filePath) {
    if (/\.(png|svg|ico)$/.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=2592000');
    } else if (/\.(css|js)$/.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=3600');
    }
  },
}));

app.use((req, res) => {
  res.status(404).sendFile(join(root, 'public', 'index.html'));
});

const server = app.listen(config.port, () => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    at: 'boot',
    port: config.port,
    env: config.env,
    model: config.model,
  }));
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
