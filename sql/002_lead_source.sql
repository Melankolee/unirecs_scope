-- Addresses now arrive from two places: the gate before the verdict, and the
-- "Get access" form on the landing page. Without a column telling them apart
-- the report cannot read `email_submit → verdict_shown` any more — every
-- landing signup would look like a check that was never finished.
--
-- 'gate' is the default so every row written before this migration keeps its
-- meaning. Migrations are re-applied in full on every run, so this stays
-- idempotent.

ALTER TABLE leads_scopeguard
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'gate';

CREATE INDEX IF NOT EXISTS leads_scopeguard_source_idx ON leads_scopeguard (source);
