-- Scope roster data and the team activity feed to authenticated league owners.
CREATE OR REPLACE FUNCTION public.current_user_owns_league(p_league_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.leagues AS league
    JOIN public."user" AS profile ON profile.id = league.user_id
    WHERE league.id = p_league_id
      AND profile.auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_owns_team_in_league(
  p_team_id bigint,
  p_league_id bigint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT public.current_user_owns_league(p_league_id)
    AND EXISTS (
      SELECT 1
      FROM public.teams AS team
      WHERE team.id = p_team_id
        AND team.league_id = p_league_id
    );
$$;

REVOKE ALL ON FUNCTION public.current_user_owns_league(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_owns_team_in_league(bigint, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_owns_league(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_owns_team_in_league(bigint, bigint) TO authenticated;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teams_league_owner_select ON public.teams;
CREATE POLICY teams_league_owner_select ON public.teams
  FOR SELECT TO authenticated
  USING (public.current_user_owns_league(league_id));
DROP POLICY IF EXISTS teams_league_owner_insert ON public.teams;
CREATE POLICY teams_league_owner_insert ON public.teams
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_owns_league(league_id));
DROP POLICY IF EXISTS teams_league_owner_update ON public.teams;
CREATE POLICY teams_league_owner_update ON public.teams
  FOR UPDATE TO authenticated
  USING (public.current_user_owns_league(league_id))
  WITH CHECK (public.current_user_owns_league(league_id));
DROP POLICY IF EXISTS teams_league_owner_delete ON public.teams;
CREATE POLICY teams_league_owner_delete ON public.teams
  FOR DELETE TO authenticated
  USING (public.current_user_owns_league(league_id));

DROP POLICY IF EXISTS players_league_owner_select ON public.players;
CREATE POLICY players_league_owner_select ON public.players
  FOR SELECT TO authenticated
  USING (public.current_user_owns_league(league_id));
DROP POLICY IF EXISTS players_league_owner_insert ON public.players;
CREATE POLICY players_league_owner_insert ON public.players
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_owns_league(league_id)
    AND team_id IS NOT NULL
    AND public.current_user_owns_team_in_league(team_id, league_id)
  );
DROP POLICY IF EXISTS players_league_owner_update ON public.players;
CREATE POLICY players_league_owner_update ON public.players
  FOR UPDATE TO authenticated
  USING (public.current_user_owns_league(league_id))
  WITH CHECK (
    public.current_user_owns_league(league_id)
    AND team_id IS NOT NULL
    AND public.current_user_owns_team_in_league(team_id, league_id)
  );
DROP POLICY IF EXISTS players_league_owner_delete ON public.players;
CREATE POLICY players_league_owner_delete ON public.players
  FOR DELETE TO authenticated
  USING (public.current_user_owns_league(league_id));

DROP POLICY IF EXISTS team_activity_league_owner_select ON public.team_activity;
CREATE POLICY team_activity_league_owner_select ON public.team_activity
  FOR SELECT TO authenticated
  USING (public.current_user_owns_league(league_id));
DROP POLICY IF EXISTS team_activity_league_owner_insert ON public.team_activity;
CREATE POLICY team_activity_league_owner_insert ON public.team_activity
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_owns_league(league_id)
    AND actor_auth_user_id = auth.uid()
    AND (team_id IS NULL OR public.current_user_owns_team_in_league(team_id, league_id))
  );
