-- Keep timetable rows private to the authenticated owner of their league.
ALTER TABLE public.timetable
  ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.timetable
  ADD COLUMN IF NOT EXISTS schedule_type text NOT NULL DEFAULT 'regular';

DO $$
BEGIN
  ALTER TABLE public.timetable
    ADD CONSTRAINT timetable_schedule_type_check
    CHECK (schedule_type IN ('regular', 'pre_bowl', 'post_bowl'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS timetable_league_owner_select ON public.timetable;
CREATE POLICY timetable_league_owner_select ON public.timetable
  FOR SELECT TO authenticated
  USING (public.current_user_owns_league(league_id));

DROP POLICY IF EXISTS timetable_league_owner_insert ON public.timetable;
CREATE POLICY timetable_league_owner_insert ON public.timetable
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_owns_league(league_id)
    AND EXISTS (
      SELECT 1 FROM public.blocks AS block_row
      WHERE block_row.id = timetable.block_id AND block_row.league_id = timetable.league_id
    )
    AND public.current_user_owns_team_in_league(timetable.team1_id, timetable.league_id)
    AND public.current_user_owns_team_in_league(timetable.team2_id, timetable.league_id)
    AND timetable.team1_id <> timetable.team2_id
  );

DROP POLICY IF EXISTS timetable_league_owner_update ON public.timetable;
CREATE POLICY timetable_league_owner_update ON public.timetable
  FOR UPDATE TO authenticated
  USING (public.current_user_owns_league(league_id))
  WITH CHECK (
    public.current_user_owns_league(league_id)
    AND EXISTS (
      SELECT 1 FROM public.blocks AS block_row
      WHERE block_row.id = timetable.block_id AND block_row.league_id = timetable.league_id
    )
    AND public.current_user_owns_team_in_league(timetable.team1_id, timetable.league_id)
    AND public.current_user_owns_team_in_league(timetable.team2_id, timetable.league_id)
    AND timetable.team1_id <> timetable.team2_id
  );

DROP POLICY IF EXISTS timetable_league_owner_delete ON public.timetable;
CREATE POLICY timetable_league_owner_delete ON public.timetable
  FOR DELETE TO authenticated
  USING (public.current_user_owns_league(league_id));
