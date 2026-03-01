-- supabase/migrations/001_ghl_marketplace_tables.sql
-- Paste this into Supabase Dashboard → SQL Editor → Run
-- Or run: supabase db push

-- ── Tokens table: one row per connected GHL location
CREATE TABLE IF NOT EXISTS public.ghl_tokens (
  "locationId"   TEXT        PRIMARY KEY,
  access_token   TEXT        NOT NULL,
  refresh_token  TEXT        NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  scope          TEXT        NOT NULL DEFAULT '',
  connected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only the Netlify functions (using service role key) can read/write
ALTER TABLE public.ghl_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_tokens" ON public.ghl_tokens;
CREATE POLICY "service_role_only_tokens" ON public.ghl_tokens
  USING (auth.role() = 'service_role');

-- ── Installs table: records when GHL sends the install webhook
CREATE TABLE IF NOT EXISTS public.ghl_installs (
  "locationId"   TEXT        PRIMARY KEY,
  "agencyId"     TEXT,
  installed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload    JSONB
);

ALTER TABLE public.ghl_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_installs" ON public.ghl_installs;
CREATE POLICY "service_role_only_installs" ON public.ghl_installs
  USING (auth.role() = 'service_role');
