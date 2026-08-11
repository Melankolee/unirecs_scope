import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { assertConfig, config } from './config.js';
import { api } from './routes/api.js';
import { pool } from './db.js';

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

app.use(express.static(join(root, 'public'), { extensions: ['html'] }));

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
