-- Scope Creep Guard — one table, on purpose.
--
-- What is NOT here, and must never be added: the `scope` and `request` texts.
-- The landing page promises those are not stored; only their lengths are.

CREATE TABLE IF NOT EXISTS leads_scopeguard (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ad attribution, read from the URL on entry
  visitor_id    TEXT,
  gclid         TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,

  -- filled once the check completes
  verdict       TEXT,
  confidence    TEXT,
  scope_len     INTEGER,
  request_len   INTEGER,

  reply_copied  BOOLEAN     NOT NULL DEFAULT FALSE,
  price_cta     BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS leads_scopeguard_email_idx      ON leads_scopeguard (lower(email));
CREATE INDEX IF NOT EXISTS leads_scopeguard_visitor_idx    ON leads_scopeguard (visitor_id);
CREATE INDEX IF NOT EXISTS leads_scopeguard_created_at_idx ON leads_scopeguard (created_at);
