import { randomUUID } from 'node:crypto';
import { config } from './config.js';

/**
 * The visitor cookie, shared by the API and by the page-view counter in
 * `server.js`. It lives here rather than in `routes/api.js` because both sides
 * have to set the *same* cookie: a second identifier would count one person
 * twice on their first page and break every funnel stitched on this one.
 *
 * `scopeguard` in the name is a key, not a product name — see CLAUDE.md.
 */
export const VISITOR_COOKIE = 'sg_vid';

const COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

export function visitorId(req, res) {
  let id = req.cookies?.[VISITOR_COOKIE];
  if (!id || typeof id !== 'string' || id.length > 64) {
    id = randomUUID();
    res.cookie(VISITOR_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.cookieSecure,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }
  return id;
}
