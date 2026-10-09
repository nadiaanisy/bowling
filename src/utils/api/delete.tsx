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
