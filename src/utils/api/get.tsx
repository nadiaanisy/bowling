import { League, User } from '../interfaces';
import { sql_query, table } from '../constants/db';
import { catchError } from '../functions/toasts';
import { getHelper } from '../supabase/supabaseHelper';
import { errorToastStyle } from '../functions/toast-styles';

/* Authenticates the user and returns their data if successful. */
export const loginUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    const { data, error } = await getHelper(table.user, sql_query.all)
      .eq('user_name', username)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Supabase login error:', error.message, errorToastStyle);
      return null;
    }

    return data as unknown as User;
  } catch (err) {
    catchError('Login failed: ', err);
    return null;
  }
};

/* Fetches leagues associated with the specified user. */
export const getLeaguesByUser = async (userId: string | number) =>
  // : Promise<League[]>
  {
    // try {
    //   let query = getHelper(table.leagues, sql_query.all);
    //   if (userId !== 1) {
    //     query = query.eq('user_id', userId);
    //   }
    //   const { data, error } = await query.order('updated_at', {
    //     ascending: false,
    //   });
    //   if (error) {
    //     throw new Error(error.message);
    //   }
    //   return (data || []) as unknown as League[];
    // } catch (err) {
    //   throw err instanceof Error ? err : new Error('Unexpected error while fetching leagues.');
    // }
  };

/* Checks whether a league has any blocks. */
export const checkIfLeagueHasBlocks = async (
  leagueId: string | number,
): Promise<boolean> => {
  try {
    // const { data, error } = await getHelper(table.blocks, sql_query.all).eq(
    //   'league_id',
    //   leagueId,
    // );

    // if (error) {
    //   toast.error(
    //     'Error checking league blocks: ' + error.message,
    //     errorToastStyle,
    //   );
    //   return false;
    // }

    // if (data && data.length > 0) {
    //   return true;
    // }

    return false;
  } catch (err) {
    catchError('Error checking league blocks:', err);
    return false;
  }
};
