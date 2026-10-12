import { toast } from 'sonner';
import { table } from '../constants/db';
import { errorToastStyle } from '../functions/toast-styles';
import { catchError } from '../functions/toasts';
import { deleteHelper } from '../supabase/supabaseHelper';

/* Deletes a league and all associated data from related tables. */
export const deleteLeagueWithData = async (
  leagueId: string | number,
): Promise<boolean | null> => {
  try {
    const childTables = [
      table.blocks,
      table.teams,
      table.players,
      table.timetable,
      table.weeklyScore,
      table.handicapSettings,
    ];

    for (const childTable of childTables) {
      const { error } = await deleteHelper(childTable).eq(
        'league_id',
        leagueId,
      );

      if (error) {
        toast.error(
          `Error deleting league data from ${childTable}: ${error.message}`,
          errorToastStyle,
        );
        return false;
      }
    }

    const { error } = await deleteHelper(table.leagues).eq('id', leagueId);

    if (error) {
      toast.error('Error deleting league: ' + error.message, errorToastStyle);
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error deleting league: ', err);
    return null;
  }
};

/* Deletes a single handicap setting from a league. */
export const deleteHandicapSetting = async (
  id: string | number,
  leagueId: string | number,
): Promise<boolean | null> => {
  try {
    const { data, error } = await deleteHelper(table.handicapSettings)
      .eq('id', id)
      .eq('league_id', leagueId)
      .select('id');

    if (error) {
      toast.error('Error deleting handicap: ' + error.message, errorToastStyle);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (err) {
    catchError('Error deleting handicap: ', err);
    return null;
  }
};

/* Deletes multiple handicap settings from a league in bulk. */
export const deleteHandicapSettings = async (
  ids: Array<string | number>,
  leagueId: string | number,
): Promise<number | null> => {
  if (ids.length === 0) return 0;

  try {
    const { data, error } = await deleteHelper(table.handicapSettings)
      .in('id', ids)
      .eq('league_id', leagueId)
      .select('id');

    if (error) {
      toast.error(
        'Error deleting handicaps: ' + error.message,
        errorToastStyle,
      );
      return 0;
    }

    return data?.length ?? 0;
  } catch (err) {
    catchError('Error deleting handicaps: ', err);
    return null;
  }
};
