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

/* Adds a single gender-specific handicap setting for a league. */
export const addHandicapSetting = async (
  leagueId: string | number,
  average: number,
  menHandicap: number,
  womenHandicap: number | null,
): Promise<HandicapSetting | null> => {
  try {
    if (!Number.isFinite(average) || average < 0) {
      toast.error(
        'Average must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
    }

    if (!Number.isFinite(menHandicap) || menHandicap < 0) {
      toast.error(
        'Men handicap must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
    }

    if (
      womenHandicap !== null &&
      (!Number.isFinite(womenHandicap) || womenHandicap < 0)
    ) {
      toast.error(
        'Women handicap must be a valid non-negative number.',
        errorToastStyle,
      );
      return null;
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
      toast.error('Error adding handicap: ' + error.message, errorToastStyle);
      return null;
    }

    return data as unknown as HandicapSetting;
  } catch (err) {
    catchError('Error adding handicap: ', err);
    return null;
  }
};

/* Adds multiple gender-specific handicap settings for a league in bulk. */
export const addHandicapSettings = async (
  leagueId: string | number,
  settings: Array<{
    average: number;
    men_handicap: number;
    women_handicap: number | null;
  }>,
): Promise<HandicapSetting[]> => {
  if (settings.length === 0) return [];

  try {
    const invalid = settings.some(
      (setting) =>
        !Number.isFinite(setting.average) ||
        setting.average < 0 ||
        !Number.isFinite(setting.men_handicap) ||
        setting.men_handicap < 0 ||
        (setting.women_handicap !== null &&
          (!Number.isFinite(setting.women_handicap) ||
            setting.women_handicap < 0)),
    );

    if (invalid) {
      toast.error(
        'All averages and handicap values must be valid non-negative numbers.',
        errorToastStyle,
      );
      return [];
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
      toast.error('Error adding handicaps: ' + error.message, errorToastStyle);
      return [];
    }

    return (data ?? []) as unknown as HandicapSetting[];
  } catch (err) {
    catchError('Error adding handicaps: ', err);
    return [];
  }
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
    const createdAt = new Date().toISOString();
    const { data, error } = await insertHelper(table.players, {
      name,
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
    const createdAt = new Date().toISOString();
    const players = names.map((name) => ({
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

    return (data || []) as unknown as LeagueMember[];
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
    const createdAt = new Date().toISOString();
    const { data, error } = await insertHelper(table.teams, {
      name,
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
    const createdAt = new Date().toISOString();

    const teams = names.map((name) => ({
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

    return (data || []) as unknown as LeagueTeam[];
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
