-- Keep the bigint implementation as the single PostgREST RPC candidate.
-- League IDs are stored as bigint/int8, and the duplicate integer overload
-- makes PostgREST unable to resolve get_full_timetable(p_league_id).
DROP FUNCTION IF EXISTS public.get_full_timetable(integer);

NOTIFY pgrst, 'reload schema';
