import {
  HandicapSetting,
  League,
  LeagueMember,
  LeagueTeam,
} from '../interfaces';
import { recordTeamActivity } from './teamArchive';
import { table } from '../constants/db';
import { catchError } from '../../functions/toasts';
import { getBowlerCategory } from '../../functions/players';
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

    const updatedTeam = data as unknown as LeagueTeam;
    await recordTeamActivity(leagueId, teamId, 'team.updated', {
      team_name: updatedTeam.name,
      previous_name: (team as { name?: string | null }).name ?? null,
    });
    return updatedTeam;
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
    const { data: leagueConfigData, error: configError } = await getHelper(
      table.leagues,
      'setup_config',
    )
      .eq('id', leagueId)
      .maybeSingle();
    if (configError)
      throw new Error(
        `Unable to load League Setup rules: ${configError.message}`,
      );
    const leagueConfig = leagueConfigData as unknown as {
      setup_config: Record<string, unknown> | null;
    } | null;
    const rosterLimit = Number(leagueConfig?.setup_config?.max_roster_size);
    if (Number.isSafeInteger(rosterLimit) && rosterLimit > 0) {
      const { count, error: rosterError } = await getHelper(
        table.players,
        'id',
        {
          count: 'exact',
          head: true,
        },
      )
        .eq('team_id', toTeamId)
        .eq('league_id', leagueId)
        .is('archived_at', null);
      if (rosterError)
        throw new Error(
          `Unable to check destination roster: ${rosterError.message}`,
        );
      if ((count ?? 0) + uniqueIds.length > rosterLimit) {
        const remaining = Math.max(0, rosterLimit - (count ?? 0));
        toast.error(
          `Only ${remaining} roster slot(s) remain on the destination team.`,
          errorToastStyle,
        );
        return [];
      }
    }

    const setupConfig = leagueConfig?.setup_config ?? {};
    const openThreshold = Number(setupConfig.open_average_threshold);
    const maxOpen = Number(setupConfig.open_bowlers_max);
    if (
      setupConfig.allow_open_bowlers === true &&
      Number.isFinite(openThreshold) &&
      openThreshold > 0 &&
      Number.isSafeInteger(maxOpen) &&
      maxOpen >= 0
    ) {
      const [
        { data: movingPlayers, error: movingError },
        { data: destinationPlayers, error: destinationError },
      ] = await Promise.all([
        getHelper(table.players, 'id, average')
          .in('id', uniqueIds)
          .eq('team_id', fromTeamId)
          .eq('league_id', leagueId)
          .is('archived_at', null),
        getHelper(table.players, 'average')
          .eq('team_id', toTeamId)
          .eq('league_id', leagueId)
          .is('archived_at', null),
      ]);
      if (movingError || destinationError) {
        throw new Error(
          `Unable to check Open Bowler limits: ${movingError?.message ?? destinationError?.message}`,
        );
      }
      const movingPlayerRows = (movingPlayers ?? []) as unknown as Array<{
        average: number | null;
      }>;
      const destinationPlayerRows = (destinationPlayers ??
        []) as unknown as Array<{ average: number | null }>;
      const movingOpenCount = movingPlayerRows.filter(
        (player) =>
          player.average != null && Number(player.average) < openThreshold,
      ).length;
      const destinationOpenCount = destinationPlayerRows.filter(
        (player) =>
          player.average != null && Number(player.average) < openThreshold,
      ).length;
      if (destinationOpenCount + movingOpenCount > maxOpen) {
        toast.error(
          `The destination team has only ${Math.max(0, maxOpen - destinationOpenCount)} Open Bowler slot(s) remaining.`,
          errorToastStyle,
        );
        return [];
      }
    }

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

    const transferredPlayers = (data ?? []) as unknown as LeagueMember[];
    await Promise.all(
      transferredPlayers.map((player) =>
        recordTeamActivity(leagueId, toTeamId, 'player.transferred', {
          player_id: player.id,
          player_name: player.name,
          from_team_id: fromTeamId,
          to_team_id: toTeamId,
        }),
      ),
    );
    return transferredPlayers;
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
    if (type === 'substitute') {
      const { data: leagueConfigData, error: configError } = await getHelper(
        table.leagues,
        'setup_config',
      )
        .eq('id', leagueId)
        .maybeSingle();
      if (configError)
        throw new Error(
          `Unable to load League Setup rules: ${configError.message}`,
        );
      const leagueConfig = leagueConfigData as unknown as {
        setup_config: Record<string, unknown> | null;
      } | null;
      if (leagueConfig?.setup_config?.allow_substitutes !== true) {
        toast.error(
          'Substitute players are disabled in League Setup.',
          errorToastStyle,
        );
        return [];
      }
    }

    const { data, error } = await updateHelper(table.players, {
      type,
      updated_at: new Date().toISOString(),
    })
      .in('id', uniqueIds)
      .eq('team_id', teamId)
      .eq('league_id', leagueId)
      .select('id, name');

    if (error) {
      toast.error('Error updating players: ' + error.message, errorToastStyle);
      return [];
    }

    const updatedPlayers = (data ?? []) as Array<{
      id: string | number;
      name?: string | null;
    }>;
    await Promise.all(
      updatedPlayers.map((player) =>
        recordTeamActivity(leagueId, teamId, 'player.updated', {
          player_id: player.id,
          player_name: player.name ?? null,
          player_type: type,
        }),
      ),
    );
    return updatedPlayers.map((player) => player.id);
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
    average?: number | null;
    gender?: string | null;
  },
): Promise<LeagueMember | null> => {
  try {
    const { data: leagueConfigData, error: configError } = await getHelper(
      table.leagues,
      'setup_config',
    )
      .eq('id', leagueId)
      .maybeSingle();
    if (configError)
      throw new Error(
        `Unable to load League Setup rules: ${configError.message}`,
      );
    const setupConfig =
      (
        leagueConfigData as unknown as {
          setup_config: Record<string, unknown> | null;
        } | null
      )?.setup_config ?? {};
    if (
      values.type === 'substitute' &&
      setupConfig.allow_substitutes !== true
    ) {
      toast.error(
        'Substitute players are disabled in League Setup.',
        errorToastStyle,
      );
      return null;
    }
    if (
      values.average !== undefined &&
      values.average !== null &&
      (!Number.isSafeInteger(values.average) || values.average < 0)
    ) {
      toast.error(
        'Average must be a whole number greater than or equal to 0.',
        errorToastStyle,
      );
      return null;
    }
    if (values.gender && !['male', 'female'].includes(values.gender)) {
      toast.error('Choose Male or Female for player gender.', errorToastStyle);
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

    const trimmedName = values.name.trim();

    if (!trimmedName) {
      toast.error('Please enter a player name.', errorToastStyle);
      return null;
    }

    const { data: existingPlayers, error: playersError } = await getHelper(
      table.players,
      'id, name, average, archived_at',
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
      average: number | null;
      archived_at: string | null;
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

    const threshold = Number(setupConfig.open_average_threshold);
    const currentPlayer = playersForDuplicateCheck.find(
      (player) => String(player.id) === String(playerId),
    );
    const effectiveAverage =
      values.average === undefined
        ? (currentPlayer?.average ?? null)
        : values.average;
    // Keep average optional until it can be derived from recorded games.
    if (getBowlerCategory(effectiveAverage, setupConfig) === 'open') {
      const maximumOpen = Number(setupConfig.open_bowlers_max);
      if (Number.isSafeInteger(maximumOpen) && maximumOpen >= 0) {
        const existingPlayerRows = (existingPlayers ?? []) as unknown as Array<{
          id: string | number;
          average: number | null;
          archived_at: string | null;
        }>;
        const otherOpenPlayers = existingPlayerRows.filter(
          (player) =>
            String(player.id) !== String(playerId) &&
            !player.archived_at &&
            player.average != null &&
            Number(player.average) < threshold,
        ).length;
        if (otherOpenPlayers >= maximumOpen) {
          toast.error(
            `This team has reached the limit of ${maximumOpen} Open Bowlers.`,
            errorToastStyle,
          );
          return null;
        }
      }
    }

    const playerUpdate: Record<string, unknown> = {
      name: trimmedName,
      type: values.type || 'regular',
      status: values.status?.trim() || null,
      notes: values.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if ('average' in values) playerUpdate.average = values.average ?? null;
    if ('gender' in values) playerUpdate.gender = values.gender ?? null;

    const { data, error } = await updateHelper(table.players, playerUpdate)
      .eq('id', playerId)
      .eq('team_id', teamId)
      .eq('league_id', leagueId)
      .select(
        'id, name, team_id, league_id, type, status, average, games, gender, notes, position, created_at, updated_at, archived_at',
      )
      .single();

    if (error) {
      toast.error('Error updating player: ' + error.message, errorToastStyle);
      return null;
    }

    const updatedPlayer = data as unknown as LeagueMember;
    await recordTeamActivity(leagueId, teamId, 'player.updated', {
      player_id: updatedPlayer.id,
      player_name: updatedPlayer.name,
      player_type: updatedPlayer.type,
      average: updatedPlayer.average ?? null,
      gender: updatedPlayer.gender ?? null,
    });

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

/** Updates the manually scheduled calendar date for a league match. */
export const updateMatchSessionDate = async (
  matchId: string | number,
  leagueId: string | number,
  scheduledDate: string,
): Promise<boolean> => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) ||
    Number.isNaN(Date.parse(`${scheduledDate}T00:00:00Z`))
  ) {
    toast.error('Choose a valid session date.', errorToastStyle);
    return false;
  }

  const { data, error } = await updateHelper(table.timetable, {
    scheduled_date: scheduledDate,
  })
    .eq('id', matchId)
    .eq('league_id', leagueId)
    .select('id')
    .maybeSingle();

  if (error) {
    toast.error(
      `Unable to update session date: ${error.message}`,
      errorToastStyle,
    );
    return false;
  }
  return Boolean(data);
};
