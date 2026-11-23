-- Keep handicap averages unique per league, even if two requests arrive together.
CREATE OR REPLACE FUNCTION public.prevent_duplicate_handicap_average()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_setup jsonb;
  v_men_max numeric;
  v_women_max numeric;
BEGIN
  SELECT league.setup_config
    INTO v_setup
    FROM public.leagues AS league
   WHERE league.id = NEW.league_id
   FOR UPDATE;

  IF COALESCE(v_setup ->> 'enable_handicap', 'false') = 'true'
     AND COALESCE(v_setup ->> 'calculation_method', '') <> 'No handicap' THEN
    v_men_max := CASE
      WHEN COALESCE(v_setup ->> 'men_maximum', '') ~ '^\d+(\.\d+)?$'
        THEN (v_setup ->> 'men_maximum')::numeric
      ELSE 0
    END;
    v_women_max := CASE
      WHEN COALESCE(v_setup ->> 'ladies_maximum', '') ~ '^\d+(\.\d+)?$'
        THEN (v_setup ->> 'ladies_maximum')::numeric
      ELSE 0
    END;

    IF NEW.men_handicap > v_men_max THEN
      RAISE EXCEPTION 'Men handicap % exceeds the league maximum of %.', NEW.men_handicap, v_men_max
        USING ERRCODE = '23514';
    END IF;
    IF NEW.women_handicap IS NOT NULL AND NEW.women_handicap > v_women_max THEN
      RAISE EXCEPTION 'Women handicap % exceeds the league maximum of %.', NEW.women_handicap, v_women_max
        USING ERRCODE = '23514';
    END IF;
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(NEW.league_id::text || ':' || NEW.average::text, 0)
  );

  IF EXISTS (
    SELECT 1
    FROM public.handicap_settings AS existing
    WHERE existing.league_id = NEW.league_id
      AND existing.average = NEW.average
      AND existing.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'Average % already exists for this league.', NEW.average
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_handicap_average
  ON public.handicap_settings;
CREATE TRIGGER prevent_duplicate_handicap_average
  BEFORE INSERT OR UPDATE
  ON public.handicap_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_handicap_average();

-- Do not enable Handicap or lower its maximum below already-saved rules.
CREATE OR REPLACE FUNCTION public.prevent_league_handicap_max_below_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
  v_men_max numeric;
  v_women_max numeric;
  v_offending_averages text;
BEGIN
  IF OLD.setup_config -> 'enable_handicap' IS NOT DISTINCT FROM NEW.setup_config -> 'enable_handicap'
     AND OLD.setup_config -> 'calculation_method' IS NOT DISTINCT FROM NEW.setup_config -> 'calculation_method'
     AND OLD.setup_config -> 'men_maximum' IS NOT DISTINCT FROM NEW.setup_config -> 'men_maximum'
     AND OLD.setup_config -> 'ladies_maximum' IS NOT DISTINCT FROM NEW.setup_config -> 'ladies_maximum' THEN
    RETURN NEW;
  END IF;

  v_enabled := COALESCE(NEW.setup_config ->> 'enable_handicap', 'false') = 'true'
    AND COALESCE(NEW.setup_config ->> 'calculation_method', '') <> 'No handicap';
  IF NOT v_enabled THEN
    RETURN NEW;
  END IF;

  v_men_max := CASE
    WHEN COALESCE(NEW.setup_config ->> 'men_maximum', '') ~ '^\d+(\.\d+)?$'
      THEN (NEW.setup_config ->> 'men_maximum')::numeric
    ELSE 0
  END;
  v_women_max := CASE
    WHEN COALESCE(NEW.setup_config ->> 'ladies_maximum', '') ~ '^\d+(\.\d+)?$'
      THEN (NEW.setup_config ->> 'ladies_maximum')::numeric
    ELSE 0
  END;

  SELECT string_agg(rule.average::text, ', ' ORDER BY rule.average)
    INTO v_offending_averages
    FROM public.handicap_settings AS rule
   WHERE rule.league_id = NEW.id
     AND (rule.men_handicap > v_men_max
       OR (rule.women_handicap IS NOT NULL AND rule.women_handicap > v_women_max));

  IF v_offending_averages IS NOT NULL THEN
    RAISE EXCEPTION 'Handicap maximums are below existing rules. Review AVG: %.', v_offending_averages
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_league_handicap_max_below_rules
  ON public.leagues;
CREATE TRIGGER prevent_league_handicap_max_below_rules
  BEFORE UPDATE OF setup_config
  ON public.leagues
  FOR EACH ROW
  WHEN (OLD.setup_config IS DISTINCT FROM NEW.setup_config)
  EXECUTE FUNCTION public.prevent_league_handicap_max_below_rules();

-- Record all rule changes in the existing audit table.
CREATE OR REPLACE FUNCTION public.audit_handicap_setting_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.handicap_change_history (
      league_id, entity_type, entity_id, action, before_values, after_values, actor_id
    ) VALUES (
      NEW.league_id, 'handicap_rule', NEW.id, 'created', NULL, to_jsonb(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (to_jsonb(OLD) - 'updated_at') IS DISTINCT FROM (to_jsonb(NEW) - 'updated_at') THEN
      INSERT INTO public.handicap_change_history (
        league_id, entity_type, entity_id, action, before_values, after_values, actor_id
      ) VALUES (
        NEW.league_id, 'handicap_rule', NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.handicap_change_history (
      league_id, entity_type, entity_id, action, before_values, after_values, actor_id
    ) VALUES (
      OLD.league_id, 'handicap_rule', OLD.id, 'deleted', to_jsonb(OLD), NULL, auth.uid()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_handicap_setting_change
  ON public.handicap_settings;
CREATE TRIGGER audit_handicap_setting_change
  AFTER INSERT OR UPDATE OR DELETE
  ON public.handicap_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_handicap_setting_change();

-- Log updates to Handicap fields kept in leagues.setup_config.
CREATE OR REPLACE FUNCTION public.audit_league_handicap_setup_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_keys text[] := ARRAY[
    'enable_handicap', 'calculation_method', 'base_average',
    'handicap_percentage', 'games_for_average', 'men_maximum',
    'ladies_maximum', 'round_handicap', 'promote_handicap'
  ];
  v_before jsonb;
  v_after jsonb;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(fields.key, OLD.setup_config -> fields.key),
    '{}'::jsonb
  )
    INTO v_before
    FROM unnest(v_keys) AS fields(key)
   WHERE OLD.setup_config ? fields.key;

  SELECT COALESCE(
    jsonb_object_agg(fields.key, NEW.setup_config -> fields.key),
    '{}'::jsonb
  )
    INTO v_after
    FROM unnest(v_keys) AS fields(key)
   WHERE NEW.setup_config ? fields.key;

  IF v_before IS DISTINCT FROM v_after THEN
    INSERT INTO public.handicap_change_history (
      league_id, entity_type, entity_id, action, before_values, after_values, actor_id
    ) VALUES (
      NEW.id, 'league_config', NULL, 'updated', v_before, v_after, auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_league_handicap_setup_change
  ON public.leagues;
CREATE TRIGGER audit_league_handicap_setup_change
  AFTER UPDATE OF setup_config
  ON public.leagues
  FOR EACH ROW
  WHEN (OLD.setup_config IS DISTINCT FROM NEW.setup_config)
  EXECUTE FUNCTION public.audit_league_handicap_setup_change();

-- Let signed-in league owners view history; trigger inserts use definer rights.
CREATE OR REPLACE FUNCTION public.can_view_league_handicap_history(p_league_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leagues AS league
    JOIN public."user" AS profile ON profile.id = league.user_id
    WHERE league.id = p_league_id
      AND profile.auth_user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.can_view_league_handicap_history(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_league_handicap_history(bigint) TO authenticated;

ALTER TABLE public.handicap_change_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS league_owners_view_handicap_history
  ON public.handicap_change_history;
CREATE POLICY league_owners_view_handicap_history
  ON public.handicap_change_history
  FOR SELECT
  TO authenticated
  USING (public.can_view_league_handicap_history(league_id));
