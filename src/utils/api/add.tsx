import { toast } from 'sonner';
import { catchError } from '../functions/toasts';
import { errorToastStyle } from '../functions/toast-styles';
import { insertHelper } from '../supabase/supabaseHelper';
import { table } from '../constants/db';
import { League } from '../interfaces';

/* Creates the specified number of blocks for a league. */
export const addBlockForLeague = async (
  leagueId: string | number,
  count: number,
): Promise<boolean | null> => {
  try {
    const blocks = Array.from({ length: count }, (_, index) => ({
      league_id: leagueId,
      number: index + 1,
    }));

    const { error } = await insertHelper(table.blocks, blocks);

    if (error) {
      toast.error(
        'Error inserting league blocks: ' + error.message,
        errorToastStyle,
      );
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error inserting league blocks: ', err);
    return null;
  }
};

/* Creates a new league and returns its details. */
export const addLeague = async (
  name: string,
  userId: string | number,
): Promise<League | null> => {
  try {
    const createdAt = new Date().toISOString();
    const { data, error } = await insertHelper(table.leagues, {
      name,
      user_id: userId,
      created_at: createdAt,
    })
      .select('id, name, user_id, created_at, updated_at')
      .single();

    if (error) {
      toast.error('Error creating league: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as League;
  } catch (err) {
    catchError('Error creating league: ', err);
    return null;
  }
};
