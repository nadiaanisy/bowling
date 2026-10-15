import { toast } from 'sonner';
import { errorToastStyle } from '../functions/toast-styles';
import { catchError } from '../functions/toasts';
import { updateHelper } from '../supabase/supabaseHelper';
import { table } from '../constants/db';
import { HandicapSetting } from '../interfaces';
import { supabase } from '../supabase/supabaseClient';

/* Updates a league's configuration settings and timestamp. */
export const updateLeagueSetup = async (
  leagueId: string | number,
  gamesPerWeek: number,
  playersPerGame: number,
  startingLane: number,
  totalLanes: number,
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();

    const { error } = await updateHelper(table.leagues, {
      games_per_week: String(gamesPerWeek),
      players_per_game: String(playersPerGame),
      starting_lane: String(startingLane),
      total_lanes: String(totalLanes),
      updated_at: updatedAt,
    }).eq('id', leagueId);

    if (error) {
      toast.error(
        'Error updating league setup: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error updating league setup: ', err);
    return null;
  }
};

/* Updates the league's last modified timestamp. */
export const touchLeagueUpdatedAt = async (
  leagueId: string | number,
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();
    const { error } = await updateHelper(table.leagues, {
      updated_at: updatedAt,
    }).eq('id', leagueId);

    if (error) {
      toast.error(
        'Error updating league timestamp: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error updating league timestamp: ', err);
    return null;
  }
};

/* Updates the team's last modified timestamp within a specific league. */
export const touchTeamUpdatedAt = async (
  teamId: string | number,
  leagueId: string | number,
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();
    const { error } = await updateHelper(table.teams, {
      updated_at: updatedAt,
    })
      .eq('id', teamId)
      .eq('league_id', leagueId);

    if (error) {
      toast.error(
        'Error updating team timestamp: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error updating team timestamp: ', err);
    return null;
  }
};

/* Updates a gender-specific handicap setting and its timestamp. */
export const updateHandicapSetting = async (
  id: string | number,
  leagueId: string | number,
  average: number,
  menHandicap: number,
  womenHandicap: number | null,
): Promise<HandicapSetting | null> => {
  try {
    if (!Number.isFinite(average) || average < 0) {
      toast.error(
        'Average must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
    }
    if (!Number.isFinite(menHandicap) || menHandicap < 0) {
      toast.error(
        'Men handicap must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
    }
    if (
      womenHandicap !== null &&
      (!Number.isFinite(womenHandicap) || womenHandicap < 0)
    ) {
      toast.error(
        'Women handicap must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
    }

    const updatedAt = new Date().toISOString();
    const { data, error } = await updateHelper(table.handicapSettings, {
      average,
      men_handicap: menHandicap,
      women_handicap: womenHandicap,
      updated_at: updatedAt,
    })
      .eq('id', id)
      .eq('league_id', leagueId)
      .select(
        'id, league_id, average, men_handicap, women_handicap, created_at, updated_at',
      )
      .single();

    if (error) {
      toast.error('Error updating handicap: ' + error.message, errorToastStyle);
      return null;
    }
    return data as unknown as HandicapSetting;
  } catch (err) {
    catchError('Error updating handicap: ', err);
    return null;
  }
};

/* Updates or creates a league's maximum handicap configuration. */
export const saveLeagueHandicapConfig = async (
  leagueId: string | number,
  menMaxHandicap: number,
  womenMaxHandicap: number,
): Promise<boolean> => {
  try {
    if (
      !Number.isInteger(menMaxHandicap) ||
      menMaxHandicap < 0 ||
      !Number.isInteger(womenMaxHandicap) ||
      womenMaxHandicap < 0
    ) {
      toast.error(
        'Maximum handicaps must be non-negative whole numbers.',
        errorToastStyle,
      );
      return false;
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from('league_handicap_config').upsert(
      {
        league_id: leagueId,
        men_max_handicap: menMaxHandicap,
        women_max_handicap: womenMaxHandicap,
        updated_at: now,
      },
      { onConflict: 'league_id' },
    );

    if (error) {
      toast.error(
        'Error saving handicap configuration: ' + error.message,
        errorToastStyle,
      );
      return false;
    }
    return true;
  } catch (err) {
    catchError('Error saving handicap configuration: ', err);
    return false;
  }
};
