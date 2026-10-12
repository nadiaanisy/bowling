import { toast } from 'sonner';
import { errorToastStyle } from '../functions/toast-styles';
import { catchError } from '../functions/toasts';
import { updateHelper } from '../supabase/supabaseHelper';
import { table } from '../constants/db';
import { HandicapSetting } from '../interfaces';

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

/* Updates a handicap setting and its last modified timestamp. */
export const updateHandicapSetting = async (
  id: string | number,
  leagueId: string | number,
  average: number,
  handicap: number,
): Promise<HandicapSetting | null> => {
  try {
    if (!Number.isFinite(average)) {
      toast.error('Average must be a valid number.', errorToastStyle);
      return null;
    }

    if (!Number.isFinite(handicap)) {
      toast.error('Handicap must be a valid number.', errorToastStyle);
      return null;
    }

    const updatedAt = new Date().toISOString();

    const { data, error } = await updateHelper(table.handicapSettings, {
      average,
      handicap,
      updated_at: updatedAt,
    })
      .eq('id', id)
      .eq('league_id', leagueId)
      .select('id, league_id, average, handicap, created_at, updated_at')
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
