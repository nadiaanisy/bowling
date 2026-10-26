import {
  HandicapSetting,
  League,
  LeagueMember,
  LeagueTeam,
  NewUser,
} from '../interfaces';
import { table } from '../constants/db';
import { catchError } from '../../functions/toasts';
import { supabase } from '../supabase/supabaseClient';
import { insertHelper } from '../supabase/supabaseHelper';
import { errorToastStyle } from '../../functions/toast-styles';
import { toast } from 'sonner';

const normalizeName = (name: string): string => name.trim().toLocaleLowerCase();

/* Creates a new user account and handles duplicate usernames and errors. */
export const addUser = async (
  name: string,
  username: string,
  password: string,
): Promise<NewUser | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'signup-with-username',
      {
        body: {
          name: name.trim(),
          username: username.trim(),
          password,
        },
      },
    );

    if (error || !data?.profile) {
      const message =
        data?.error ?? error?.message ?? 'Unable to create account.';

      toast.error(message, errorToastStyle);
      return null;
    }

    return data.profile as NewUser;
  } catch (err) {
    catchError('Signup failed: ', err);
    toast.error(
      'Unable to create account right now. Please try again.',
      errorToastStyle,
    );
    return null;
  }
};

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

/* Sets up a league and its blocks atomically through a Supabase RPC call. */
export const setupLeagueAtomic = async (
  leagueId: string | number,
  blockCount: number,
  gamesPerWeek: number,
  playersPerGame: number,
  startingLane: number,
  totalLanes: number,
): Promise<string> => {
  const { data, error } = await supabase.rpc('setup_league_atomic', {
    p_league_id: Number(leagueId),
    p_block_count: blockCount,
    p_games_per_week: gamesPerWeek,
    p_players_per_game: playersPerGame,
    p_starting_lane: startingLane,
    p_total_lanes: totalLanes,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('League setup returned no timestamp.');
  }

  return data;
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

/* Adds a single handicap setting for a league. */
export const addHandicapSetting = async (
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

  const now = new Date().toISOString();

  const { data, error } = await insertHelper(table.handicapSettings, {
    league_id: leagueId,
    average,
    men_handicap: menHandicap,
    women_handicap: womenHandicap,
    created_at: now,
    updated_at: now,
  })
    .select(
      'id, league_id, average, men_handicap, women_handicap, created_at, updated_at',
    )
    .single();

  if (error) {
    throw new Error(`Unable to add handicap: ${error.message}`);
  }

  if (!data) {
    throw new Error('Handicap insert returned no data.');
  }

  return data as unknown as HandicapSetting;
};

/* Adds multiple handicap settings for a league. */
export const addHandicapSettings = async (
  leagueId: string | number,
  settings: Array<{
    average: number;
    men_handicap: number;
    women_handicap: number | null;
  }>,
): Promise<HandicapSetting[]> => {
  if (settings.length === 0) return [];

  const invalid = settings.some(
    (setting) =>
      !Number.isFinite(setting.average) ||
      setting.average < 0 ||
      !Number.isInteger(setting.men_handicap) ||
      setting.men_handicap < 0 ||
      (setting.women_handicap !== null &&
        (!Number.isInteger(setting.women_handicap) ||
          setting.women_handicap < 0)),
  );

  if (invalid) {
    throw new Error(
      'Averages must be non-negative numbers; handicaps must be non-negative whole numbers.',
    );
  }

  const now = new Date().toISOString();

  const rows = settings.map((setting) => ({
    league_id: leagueId,
    average: setting.average,
    men_handicap: setting.men_handicap,
    women_handicap: setting.women_handicap,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await insertHelper(
    table.handicapSettings,
    rows,
  ).select(
    'id, league_id, average, men_handicap, women_handicap, created_at, updated_at',
  );

  if (error) {
    throw new Error(`Unable to add handicap rules: ${error.message}`);
  }

  if (!data || data.length !== settings.length) {
    throw new Error(
      'The number of inserted handicap rules did not match the requested count.',
    );
  }

  return data as unknown as HandicapSetting[];
};

/* Creates the default maximum handicap configuration for a league. */
export const addLeagueHandicapConfig = async (
  leagueId: string | number,
  menMaxHandicap = 40,
  womenMaxHandicap = 50,
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const { error } = await insertHelper('league_handicap_config', {
      league_id: leagueId,
      men_max_handicap: menMaxHandicap,
      women_max_handicap: womenMaxHandicap,
      created_at: now,
      updated_at: now,
    });

    if (error && error.code !== '23505') {
      toast.error(
        'Error creating handicap configuration: ' + error.message,
        errorToastStyle,
      );
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error creating handicap configuration: ', err);
    return false;
  }
};

/* Adds a player to a team within a league. */
export const addPlayerToTeam = async (
  name: string,
  teamId: string | number,
  leagueId: string | number,
  type: 'regular' | 'substitute' = 'regular',
): Promise<LeagueMember | null> => {
  try {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error('Please enter a player name.', errorToastStyle);
      return null;
    }

    const { data: team, error: teamError } = await supabase
      .from(table.teams)
      .select('id')
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError || !team) {
      toast.error(
        'The selected team does not belong to this league.',
        errorToastStyle,
      );
      return null;
    }

    const { data: existingPlayers, error: playersError } = await supabase
      .from(table.players)
      .select('name')
      .eq('team_id', teamId)
      .eq('league_id', leagueId);

    if (playersError) {
      toast.error(
        'Unable to check existing player names: ' + playersError.message,
        errorToastStyle,
      );
      return null;
    }

    if (
      (existingPlayers ?? []).some(
        (player) =>
          normalizeName(player.name ?? '') === normalizeName(trimmedName),
      )
    ) {
      toast.error(
        'A player with this name already exists in the team.',
        errorToastStyle,
      );
      return null;
    }

    const createdAt = new Date().toISOString();

    const { data, error } = await insertHelper(table.players, {
      name: trimmedName,
      team_id: teamId,
      league_id: leagueId,
      type,
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt,
    })
      .select(
        'id, name, team_id, league_id, type, status, notes, position, created_at, updated_at',
      )
      .single();

    if (error) {
      toast.error('Error creating player: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as LeagueMember;
  } catch (err) {
    catchError('Error creating player: ', err);
    return null;
  }
};

/* Adds multiple players to a team within a league. */
export const addPlayersToTeam = async (
  names: string[],
  teamId: string | number,
  leagueId: string | number,
  type: 'regular' | 'substitute' = 'regular',
): Promise<LeagueMember[]> => {
  try {
    const uniqueNames = new Map<string, string>();

    for (const rawName of names) {
      const name = rawName.trim();
      if (!name) continue;

      const key = normalizeName(name);
      if (!uniqueNames.has(key)) uniqueNames.set(key, name);
    }

    if (uniqueNames.size === 0) {
      toast.error('Enter at least one player name.', errorToastStyle);
      return [];
    }

    const { data: team, error: teamError } = await supabase
      .from(table.teams)
      .select('id')
      .eq('id', teamId)
      .eq('league_id', leagueId)
      .maybeSingle();

    if (teamError || !team) {
      toast.error(
        'The selected team does not belong to this league.',
        errorToastStyle,
      );
      return [];
    }

    const { data: existingPlayers, error: playersError } = await supabase
      .from(table.players)
      .select('name')
      .eq('team_id', teamId)
      .eq('league_id', leagueId);

    if (playersError) {
      toast.error(
        'Unable to check existing player names: ' + playersError.message,
        errorToastStyle,
      );
      return [];
    }

    const existingNames = new Set(
      (existingPlayers ?? []).map((player) => normalizeName(player.name ?? '')),
    );

    const namesToInsert = Array.from(uniqueNames.entries())
      .filter(([key]) => !existingNames.has(key))
      .map(([, name]) => name);

    if (namesToInsert.length === 0) {
      toast.error(
        'All entered player names already exist in this team.',
        errorToastStyle,
      );
      return [];
    }

    const createdAt = new Date().toISOString();

    const players = namesToInsert.map((name) => ({
      name,
      team_id: teamId,
      league_id: leagueId,
      type,
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt,
    }));

    const { data, error } = await insertHelper(table.players, players).select(
      'id, name, team_id, league_id, type, status, notes, position, created_at, updated_at',
    );

    if (error) {
      toast.error('Error creating players: ' + error.message, errorToastStyle);
      return [];
    }

    return (data ?? []) as unknown as LeagueMember[];
  } catch (err) {
    catchError('Error creating players: ', err);
    return [];
  }
};

/* Creates a new team within a league. */
export const addTeam = async (
  name: string,
  leagueId: string | number,
): Promise<LeagueTeam | null> => {
  try {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error('Please enter a team name.', errorToastStyle);
      return null;
    }

    const { data: existingTeams, error: teamsError } = await supabase
      .from(table.teams)
      .select('name')
      .eq('league_id', leagueId);

    if (teamsError) {
      toast.error(
        'Unable to check existing team names: ' + teamsError.message,
        errorToastStyle,
      );
      return null;
    }

    if (
      (existingTeams ?? []).some(
        (team) => normalizeName(team.name ?? '') === normalizeName(trimmedName),
      )
    ) {
      toast.error(
        'A team with this name already exists in the league.',
        errorToastStyle,
      );
      return null;
    }

    const createdAt = new Date().toISOString();

    const { data, error } = await insertHelper(table.teams, {
      name: trimmedName,
      league_id: leagueId,
      created_at: createdAt,
    })
      .select('id, name, league_id, notes, created_at, updated_at')
      .single();

    if (error) {
      toast.error('Error creating team: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as LeagueTeam;
  } catch (err) {
    catchError('Error creating team: ', err);
    return null;
  }
};

/* Creates multiple teams within a league. */
export const addTeams = async (
  names: string[],
  leagueId: string | number,
): Promise<LeagueTeam[]> => {
  try {
    const uniqueNames = new Map<string, string>();

    for (const rawName of names) {
      const name = rawName.trim();
      if (!name) continue;

      const key = normalizeName(name);
      if (!uniqueNames.has(key)) uniqueNames.set(key, name);
    }

    if (uniqueNames.size === 0) {
      toast.error('Enter at least one team name.', errorToastStyle);
      return [];
    }

    const { data: existingTeams, error: teamsError } = await supabase
      .from(table.teams)
      .select('name')
      .eq('league_id', leagueId);

    if (teamsError) {
      toast.error(
        'Unable to check existing team names: ' + teamsError.message,
        errorToastStyle,
      );
      return [];
    }

    const existingNames = new Set(
      (existingTeams ?? []).map((team) => normalizeName(team.name ?? '')),
    );

    const namesToInsert = Array.from(uniqueNames.entries())
      .filter(([key]) => !existingNames.has(key))
      .map(([, name]) => name);

    if (namesToInsert.length === 0) {
      toast.error(
        'All entered team names already exist in this league.',
        errorToastStyle,
      );
      return [];
    }

    const createdAt = new Date().toISOString();

    const teams = namesToInsert.map((name) => ({
      name,
      league_id: leagueId,
      created_at: createdAt,
    }));

    const { data, error } = await insertHelper(table.teams, teams).select(
      'id, name, league_id, notes, created_at, updated_at',
    );

    if (error) {
      toast.error('Error creating teams: ' + error.message, errorToastStyle);
      return [];
    }

    return (data ?? []) as unknown as LeagueTeam[];
  } catch (err) {
    catchError('Error creating teams: ', err);
    return [];
  }
};

/* Adds a match to the league timetable for a specific week, block, and lane. */
export const addMatchToSchedule = async (
  leagueId: string | number,
  blockId: string | number,
  weekNumber: number,
  team1Id: string | number,
  team2Id: string | number,
  lane: string | number,
): Promise<boolean | null> => {
  try {
    const { error } = await insertHelper(table.timetable, {
      league_id: leagueId,
      block_id: blockId,
      week_number: weekNumber,
      team1_id: team1Id,
      team2_id: team2Id,
      lane: lane,
    });

    if (error) {
      toast.error('Error scheduling match: ' + error.message, errorToastStyle);
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error scheduling match: ', err);
    return null;
  }
};
