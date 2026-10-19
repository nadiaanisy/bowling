import { table } from '../constants/db';
import { catchError } from '../../functions/toasts';
import { supabase } from '../supabase/supabaseClient';
import {
  deleteHelper,
  getHelper
} from '../supabase/supabaseHelper';
import { errorToastStyle } from '../../functions/toast-styles';
import { toast } from 'sonner';

/* Deletes a league and all associated data from related tables. */
export const deleteLeagueWithData = async (
  leagueId: string | number,
): Promise<boolean | null> => {
  try {
    const { data, error } = await supabase.rpc('delete_league_atomic', {
      p_league_id: Number(leagueId),
    });

    if (error) {
      toast.error('Error deleting league: ' + error.message, errorToastStyle);
      return false;
    }

    if (data !== true) {
      toast.error('League was not deleted.', errorToastStyle);
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

/* Deletes multiple teams from a league. */
export const deleteTeamsFromLeague = async (
  teamIds: Array<string | number>,
  leagueId: string | number,
): Promise<number | null> => {
  if (teamIds.length === 0) return 0;

  try {
    const { data: deletedTeams, error } = await deleteHelper(table.teams)
      .in('id', teamIds)
      .eq('league_id', leagueId)
      .select('id');

    if (error) {
      toast.error('Error deleting teams: ' + error.message, errorToastStyle);
      return 0;
    }

    return deletedTeams?.length ?? 0;
  } catch (err) {
    catchError('Error deleting teams: ', err);
    return null;
  }
};

/* Deletes a single team from a league. */
export const deleteTeamFromLeague = async (
  teamId: string | number,
  leagueId: string | number,
): Promise<boolean | null> => {
  try {
    const { error } = await deleteHelper(table.teams)
      .eq('id', teamId)
      .eq('league_id', leagueId);

    if (error) {
      toast.error('Error deleting team: ' + error.message, errorToastStyle);
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error deleting team: ', err);
    return null;
  }
};

/* Deletes a player from a team after verifying the team belongs to the league. */
export const deletePlayerFromTeam = async (
  playerId: string | number,
  teamId: string | number,
  leagueId: string | number,
): Promise<boolean | null> => {
  try {
    const { data: team, error: teamError } = await getHelper(table.teams, 'id')
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError) {
      toast.error(
        'Error verifying team: ' + teamError.message,
        errorToastStyle,
      );
      return false;
    }

    if (!team) {
      toast.error(
        'The team does not belong to the selected league.',
        errorToastStyle,
      );
      return false;
    }

    const { data: deletedPlayers, error } = await deleteHelper(table.players)
      .eq('id', playerId)
      .eq('team_id', teamId)
      .select('id');

    if (error) {
      toast.error('Error deleting player: ' + error.message, errorToastStyle);
      return false;
    }

    return (deletedPlayers?.length ?? 0) > 0;
  } catch (err) {
    catchError('Error deleting player: ', err);
    return null;
  }
};

/* Deletes multiple players from a team after verifying the team belongs to the league. */
export const deletePlayersFromTeam = async (
  playerIds: Array<string | number>,
  teamId: string | number,
  leagueId: string | number,
): Promise<number | null> => {
  if (playerIds.length === 0) return 0;

  try {
    const { data: team, error: teamError } = await getHelper(table.teams, 'id')
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError) {
      toast.error(
        'Error verifying team: ' + teamError.message,
        errorToastStyle,
      );
      return 0;
    }

    if (!team) {
      toast.error(
        'The team does not belong to the selected league.',
        errorToastStyle,
      );
      return 0;
    }

    const { data: deletedPlayers, error } = await deleteHelper(table.players)
      .in('id', playerIds)
      .eq('team_id', teamId)
      .select('id');

    if (error) {
      toast.error('Error deleting players: ' + error.message, errorToastStyle);
      return 0;
    }

    return deletedPlayers?.length ?? 0;
  } catch (err) {
    catchError('Error deleting players: ', err);
    return null;
  }
};

/* Deletes a match from the timetable by its ID. */
export const deleteMatchFromSchedule = async (
  matchId: string | number,
): Promise<boolean | null> => {
  try {
    const { error } = await deleteHelper(table.timetable).eq('id', matchId);

    if (error) {
      toast.error('Error deleting match: ' + error.message, errorToastStyle);
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error deleting match: ', err);
    return null;
  }
};
