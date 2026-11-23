import {
  HandicapSetting,
  League,
  LeagueMember,
  LeagueTeam,
} from '../interfaces';
import { table } from '../constants/db';
import { catchError } from '../../functions/toasts';
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
      games_per_week: gamesPerWeek,
      players_per_game: playersPerGame,
      starting_lane: startingLane,
      total_lanes: totalLanes,
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

/** Saves the core league structure fields configured in League Setup. */
export const updateLeagueStructure = async (
  leagueId: string | number,
  values: {
    season_name: string;
    league_format: string;
    number_of_weeks: number;
    number_of_teams: number;
    number_of_blocks: number;
  },
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();
    const { error } = await updateHelper(table.leagues, {
      ...values,
      updated_at: updatedAt,
      setup_completed: true,
      setup_completed_at: updatedAt,
      is_active: true,
    }).eq('id', leagueId);

    if (error) {
      toast.error(
        'Error saving league structure: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error saving league structure: ', err);
    return null;
  }
};

/** Saves the current setup wizard draft without activating the league. */
export const saveLeagueStructureDraft = async (
  leagueId: string | number,
  values: {
    season_name: string;
    league_format: string;
    number_of_weeks: number;
    number_of_teams: number;
    number_of_blocks: number;
    games_per_week: number;
    players_per_game: number;
    starting_lane: number;
    total_lanes: number;
  },
  setupConfig: Record<string, unknown>,
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();
    const { data, error } = await updateHelper(table.leagues, {
      ...values,
      setup_config: setupConfig,
      updated_at: updatedAt,
    })
      .eq('id', leagueId)
      .select('id')
      .maybeSingle();

    if (error) {
      toast.error(
        'Error saving league setup: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    if (!data) {
      toast.error(
        'Error saving league setup: league row was not updated.',
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error saving league setup: ', err);
    return null;
  }
};

/** Saves a non-structure setup step as a partial draft on the league row. */
export const saveLeagueSetupProgress = async (
  leagueId: string | number,
  setupConfig: Record<string, unknown>,
): Promise<string | null> => {
  try {
    const updatedAt = new Date().toISOString();
    const { error } = await updateHelper(table.leagues, {
      setup_config: setupConfig,
      updated_at: updatedAt,
    }).eq('id', leagueId);

    if (error) {
      toast.error(
        'Error saving setup progress: ' + error.message,
        errorToastStyle,
      );
      return null;
    }

    return updatedAt;
  } catch (err) {
    catchError('Error saving setup progress: ', err);
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

  const { data: duplicate, error: duplicateError } = await getHelper(
    table.handicapSettings,
    'id',
  )
    .eq('league_id', leagueId)
    .eq('average', average)
    .neq('id', id)
    .maybeSingle();
  if (duplicateError) {
    throw new Error(
      `Unable to check for duplicate average: ${duplicateError.message}`,
    );
  }
  if (duplicate) {
    throw new Error(`AVG ${average} already exists in this league.`);
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

/* Transfers multiple players between teams within the same league. */
export const bulkTransferPlayersToTeam = async (
  playerIds: Array<string | number>,
  fromTeamId: string | number,
  toTeamId: string | number,
  leagueId: string | number,
): Promise<LeagueMember[]> => {
  const uniqueIds = Array.from(
    new Map(playerIds.map((id) => [String(id), id])).values(),
  );

  if (uniqueIds.length === 0) return [];

  if (String(fromTeamId) === String(toTeamId)) {
    toast.error('Choose a different destination team.', errorToastStyle);
    return [];
  }

  try {
    const { data: sourceTeam, error: sourceTeamError } = await getHelper(
      table.teams,
      'id',
    )
      .eq('id', fromTeamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (sourceTeamError) {
      toast.error(
        'Error verifying source team: ' + sourceTeamError.message,
        errorToastStyle,
      );
      return [];
    }

    if (!sourceTeam) {
      toast.error(
        'The source team does not belong to the selected league.',
        errorToastStyle,
      );
      return [];
    }

    const { data: destinationTeam, error: destinationTeamError } =
      await getHelper(table.teams, 'id')
        .eq('id', toTeamId)
        .eq('league_id', leagueId)
        .maybeSingle();

    if (destinationTeamError) {
      toast.error(
        'Error verifying destination team: ' + destinationTeamError.message,
        errorToastStyle,
      );
      return [];
    }

    if (!destinationTeam) {
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
      .in('id', uniqueIds)
      .eq('team_id', fromTeamId)
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

    return (data ?? []) as unknown as LeagueMember[];
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
): Promise<Array<string | number>> => {
  const uniqueIds = Array.from(
    new Map(playerIds.map((id) => [String(id), id])).values(),
  );

  if (uniqueIds.length === 0) return [];

  try {
    const { data, error } = await updateHelper(table.players, {
      type,
      updated_at: new Date().toISOString(),
    })
      .in('id', uniqueIds)
      .eq('team_id', teamId)
      .eq('league_id', leagueId)
      .select('id');

    if (error) {
      toast.error('Error updating players: ' + error.message, errorToastStyle);
      return [];
    }

    return (data ?? []).map((player) => player.id as string | number);
  } catch (err) {
    catchError('Error updating players: ', err);
    return [];
  }
};

/* Updates a player's details after verifying the team and player name. */
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

    const trimmedName = values.name.trim();

    if (!trimmedName) {
      toast.error('Please enter a player name.', errorToastStyle);
      return null;
    }

    const { data: existingPlayers, error: playersError } = await getHelper(
      table.players,
      'id, name',
    )
      .eq('team_id', teamId)
      .eq('league_id', leagueId);

    if (playersError) {
      toast.error(
        'Unable to check existing player names: ' + playersError.message,
        errorToastStyle,
      );
      return null;
    }

    const normalizedName = trimmedName.toLocaleLowerCase();

    const playersForDuplicateCheck = (existingPlayers ??
      []) as unknown as Array<{
      id: string | number;
      name: string | null;
    }>;

    const duplicate = playersForDuplicateCheck.some(
      (player) =>
        String(player.id) !== String(playerId) &&
        (player.name ?? '').trim().toLocaleLowerCase() === normalizedName,
    );

    if (duplicate) {
      toast.error(
        'Another player with this name already exists in the team.',
        errorToastStyle,
      );
      return null;
    }

    const { data, error } = await updateHelper(table.players, {
      name: trimmedName,
      type: values.type || 'regular',
      status: values.status?.trim() || null,
      notes: values.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
      .eq('id', playerId)
      .eq('team_id', teamId)
      .eq('league_id', leagueId)
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
