import {
  HandicapSetting,
  League,
  LeagueMember,
  LeagueTeam,
} from '../interfaces';
import { table } from '../constants/db';
import { catchError } from '../../functions/toasts';
import { supabase } from '../supabase/supabaseClient';
import {
  getHelper,
  updateHelper
} from '../supabase/supabaseHelper';
import { errorToastStyle } from '../../functions/toast-styles';
import { toast } from 'sonner';

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
): Promise<HandicapSetting> => {
  if (!Number.isFinite(average) || average < 0) {
    throw new Error('Average must be a valid non-negative number.');
  }

  if (!Number.isInteger(menHandicap) || menHandicap < 0) {
    throw new Error("Men's handicap must be a non-negative whole number.");
  }

  if (
    womenHandicap !== null &&
    (!Number.isInteger(womenHandicap) || womenHandicap < 0)
  ) {
    throw new Error("Women's handicap must be a non-negative whole number.");
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
    throw new Error(`Unable to update handicap: ${error.message}`);
  }

  if (!data) {
    throw new Error('Handicap update returned no data.');
  }

  return data as unknown as HandicapSetting;
};

/* Updates or creates a league's maximum handicap configuration. */
export const saveLeagueHandicapConfig = async (
  leagueId: string | number,
  menMaxHandicap: number,
  womenMaxHandicap: number,
): Promise<void> => {
  if (
    !Number.isInteger(menMaxHandicap) ||
    menMaxHandicap < 0 ||
    !Number.isInteger(womenMaxHandicap) ||
    womenMaxHandicap < 0
  ) {
    throw new Error('Maximum handicaps must be non-negative whole numbers.');
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
    throw new Error(`Unable to save maximum handicaps: ${error.message}`);
  }
};

/* Updates a team's name and notes after verifying it belongs to the selected league. */
export const updateTeamInLeague = async (
  teamId: string | number,
  leagueId: string | number,
  name: string,
  notes: string,
): Promise<LeagueTeam | null> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a team name.', errorToastStyle);
      return null;
    }

    const { data: team, error: teamError } = await getHelper(table.teams, 'id')
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError) {
      toast.error(
        'Error verifying team: ' + teamError.message,
        errorToastStyle,
      );
      return null;
    }

    if (!team) {
      toast.error(
        'The team does not belong to the selected league.',
        errorToastStyle,
      );
      return null;
    }

    const { data, error } = await updateHelper(table.teams, {
      name: trimmedName,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .select('id, name, league_id, notes, created_at, updated_at')
      .single();

    if (error) {
      toast.error('Error updating team: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as LeagueTeam;
  } catch (err) {
    catchError('Error updating team: ', err);
    return null;
  }
};

/* Transfers multiple players to another team within the same league. */
export const bulkTransferPlayersToTeam = async (
  playerIds: Array<string | number>,
  toTeamId: string | number,
  leagueId: string | number,
): Promise<LeagueMember[]> => {
  if (playerIds.length === 0) return [];

  try {
    const { data: team, error: teamError } = await getHelper(table.teams, 'id')
      .eq('id', toTeamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError) {
      toast.error(
        'Error verifying destination team: ' + teamError.message,
        errorToastStyle,
      );
      return [];
    }

    if (!team) {
      toast.error(
        'The destination team does not belong to the selected league.',
        errorToastStyle,
      );
      return [];
    }

    const { data, error } = await updateHelper(table.players, {
      team_id: toTeamId,
      updated_at: new Date().toISOString(),
    })
      .in('id', playerIds)
      .eq('league_id', leagueId)
      .select(
        'id, name, team_id, league_id, type, status, notes, position, created_at, updated_at',
      );

    if (error) {
      toast.error(
        'Error transferring players: ' + error.message,
        errorToastStyle,
      );
      return [];
    }

    return (data || []) as unknown as LeagueMember[];
  } catch (err) {
    catchError('Error transferring players: ', err);
    return [];
  }
};

/* Updates the player type for multiple players within a team. */
export const bulkUpdatePlayersType = async (
  playerIds: Array<string | number>,
  teamId: string | number,
  leagueId: string | number,
  type: 'regular' | 'substitute',
): Promise<number> => {
  if (playerIds.length === 0) return 0;

  try {
    const { data, error } = await updateHelper(table.players, {
      type,
      updated_at: new Date().toISOString(),
    })
      .in('id', playerIds)
      .eq('team_id', teamId)
      .eq('league_id', leagueId)
      .select('id');

    if (error) {
      toast.error('Error updating players: ' + error.message, errorToastStyle);
      return 0;
    }

    return data?.length ?? 0;
  } catch (err) {
    catchError('Error updating players: ', err);
    return 0;
  }
};

/* Updates a player's details after verifying the team belongs to the league. */
export const updatePlayerInTeam = async (
  playerId: string | number,
  teamId: string | number,
  leagueId: string | number,
  values: {
    name: string;
    type?: 'regular' | 'substitute';
    status?: string;
    notes?: string;
  },
): Promise<LeagueMember | null> => {
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
      return null;
    }

    if (!team) {
      toast.error(
        'The team does not belong to the selected league.',
        errorToastStyle,
      );
      return null;
    }

    const { data, error } = await updateHelper(table.players, {
      name: values.name.trim(),
      type: values.type || 'regular',
      status: values.status?.trim() || null,
      notes: values.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
      .eq('id', playerId)
      .eq('team_id', teamId)
      .select(
        'id, name, team_id, league_id, type, status, notes, position, created_at, updated_at',
      )
      .single();

    if (error) {
      toast.error('Error updating player: ' + error.message, errorToastStyle);
      return null;
    }

    const updatedPlayer = data as unknown as LeagueMember;
    return {
      ...updatedPlayer,
      status: updatedPlayer.status?.trim().toLowerCase() || 'active',
    };
  } catch (err) {
    catchError('Error updating player: ', err);
    return null;
  }
};

/* Updates a league name for the specified owner. */
export const updateLeagueName = async (
  leagueId: string | number,
  userId: string | number,
  name: string,
): Promise<League | null> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    toast.error('Please enter a league name.', errorToastStyle);
    return null;
  }

  try {
    const { data, error } = await updateHelper(table.leagues, {
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
      .eq('id', leagueId)
      .eq('user_id', userId)
      .select('id, name, user_id, created_at, updated_at')
      .single();

    if (error) {
      toast.error('Error updating league: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as League;
  } catch (err) {
    catchError('Error updating league: ', err);
    return null;
  }
};
