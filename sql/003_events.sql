-- Events, written on our side for every visitor.
--
-- This table exists because the browser is the wrong place to keep the count.
-- GA4 only fires once the cookie banner has been accepted, so it never saw the
-- people who ignored it — and they are not a random slice, they are a
-- particular kind of visitor. A funnel measured that way is biased, not merely
-- short. Nothing here is written to the visitor's device, so the banner has no
-- say in it; the banner still governs GA4, which does write to the device.
--
-- What is NOT here, and must never be added: the `scope` and `request` texts.
-- `params` is for names, labels and numbers. The 120-character ceiling in
-- `cleanEvent` is what keeps that true when a future caller is careless.

CREATE TABLE IF NOT EXISTS events_scopeguard (
  id         BIGSERIAL   PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name       TEXT        NOT NULL,
  -- The same `sg_vid` the free-check limit uses, so an event can be stitched to
  -- a lead without a second identifier being invented for it.
  visitor_id TEXT,
  path       TEXT,
  params     JSONB       NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS events_scopeguard_name_idx       ON events_scopeguard (name, created_at);
CREATE INDEX IF NOT EXISTS events_scopeguard_visitor_idx    ON events_scopeguard (visitor_id);
CREATE INDEX IF NOT EXISTS events_scopeguard_created_at_idx ON events_scopeguard (created_at);
