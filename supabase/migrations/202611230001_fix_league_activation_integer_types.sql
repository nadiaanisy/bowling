-- Use integer RPC parameters for integer league columns.
-- This avoids assigning text values to integer columns during activation.
CREATE OR REPLACE FUNCTION public.setup_league_atomic_typed(
  p_league_id bigint,
  p_block_count integer,
  p_games_per_week integer,
  p_players_per_game integer,
  p_starting_lane integer,
  p_total_lanes integer
)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_at timestamptz := now();
BEGIN
  IF p_block_count < 1 OR p_block_count > 10 THEN
    RAISE EXCEPTION 'Block count must be between 1 and 10.';
  END IF;

  UPDATE public.leagues
  SET games_per_week = p_games_per_week,
      players_per_game = p_players_per_game,
      starting_lane = p_starting_lane,
      total_lanes = p_total_lanes,
      updated_at = v_updated_at
  WHERE id = p_league_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'League % was not found.', p_league_id;
  END IF;

  INSERT INTO public.blocks (league_id, number)
  SELECT p_league_id, generated.block_number
  FROM generate_series(1, p_block_count) AS generated(block_number)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.blocks existing
    WHERE existing.league_id = p_league_id
      AND existing.number = generated.block_number
  );

  RETURN v_updated_at;
END;
$$;

NOTIFY pgrst, 'reload schema';
