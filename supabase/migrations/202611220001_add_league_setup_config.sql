ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS setup_config jsonb NOT NULL DEFAULT '{}'::jsonb;
