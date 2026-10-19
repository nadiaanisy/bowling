import {
  DashboardData,
  HandicapSetting,
  LeagueHandicapConfig,
  League,
  MatchData,
  MatchesByBlock,
  PlayerScoreDetails,
  User,
  LeagueTeamWithMembers,
  LeagueBlock,
  LeagueTeam,
} from '../interfaces';
import {
  sql_query,
  table
} from '../constants/db';
import { catchError } from '../../functions/toasts';
import { supabase } from '../supabase/supabaseClient';
import { getHelper } from '../supabase/supabaseHelper';
import { errorToastStyle } from '../../functions/toast-styles';
import { toast } from 'sonner';

/* Authenticates the user and returns their data if successful. */
export const loginUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'login-with-username',
      {
        body: {
          username: username.trim(),
          password,
        },
      },
    );

    if (
      error ||
      !data?.session?.access_token ||
      !data?.session?.refresh_token
    ) {
      console.error('Supabase login failed:', error?.message ?? data?.error);
      return null;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

    if (sessionError || !sessionData.user) {
      console.error(
        'Could not establish Supabase session:',
        sessionError?.message,
      );
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('user')
      .select('*')
      .eq('auth_user_id', sessionData.user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        'Could not load Bowling Project profile:',
        profileError?.message,
      );
      await supabase.auth.signOut();
      return null;
    }

    return profile as unknown as User;
  } catch (err) {
    catchError('Login failed: ', err);
    return null;
  }
};

/* Fetches leagues associated with the specified user. */
export const getLeaguesByUser = async (
  userId: string | number,
): Promise<League[]> => {
  try {
    let query = getHelper(table.leagues, sql_query.all);
    if (userId !== 1) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.order('updated_at', {
      ascending: false,
    });
    if (error) {
      throw new Error(error.message);
    }
    return (data || []) as unknown as League[];
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Unexpected error while fetching leagues.');
  }
};

/* Checks whether a league has any blocks. */
export const checkIfLeagueHasBlocks = async (
  leagueId: string | number,
): Promise<boolean> => {
  try {
    const { data, error } = await getHelper(table.blocks, sql_query.all).eq(
      'league_id',
      leagueId,
    );

    if (error) {
      toast.error(
        'Error checking league blocks: ' + error.message,
        errorToastStyle,
      );
      return false;
    }

    if (data && data.length > 0) {
      return true;
    }

    return false;
  } catch (err) {
    catchError('Error checking league blocks:', err);
    return false;
  }
};

/* Fetches the total number of teams in a league. */
export const getTeamCountByLeague = async (
  leagueId: string | number,
): Promise<number> => {
  try {
    const { data, error } = await getHelper(table.teams, sql_query.all).eq(
      'league_id',
      leagueId,
    );

    if (error) {
      toast.error(
        'Error fetching team count: ' + error.message,
        errorToastStyle,
      );
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    catchError('Error fetching team count:', err);
    return 0;
  }
};

/* Fetches the total number of blocks in a league. */
export const getBlockCountByLeague = async (
  leagueId: string | number | null,
): Promise<number> => {
  if (leagueId === null) return 0;

  try {
    const { count, error } = await getHelper(table.blocks, sql_query.all, {
      count: 'exact',
      head: true,
    }).eq('league_id', leagueId);

    if (error) {
      toast.error(
        'Error fetching block count: ' + error.message,
        errorToastStyle,
      );
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    catchError('Error fetching block count:', err);
    return 0;
  }
};

/* Fetches and summarizes dashboard statistics for a league. */
export const getDashboardDataByLeagueId = async (
  leagueId: string | number | null,
): Promise<DashboardData | null> => {
  if (leagueId === null) return null;

  try {
    const { data } = await getHelper(table.teams, sql_query.all, {
      count: 'exact',
    }).eq('league_id', leagueId);

    const totalTeams = (data || []).filter(
      (team: any) => team.name?.toLowerCase() !== 'blind',
    ).length;

    const totalPlayers = await getHelper(table.players, sql_query.all, {
      count: 'exact',
      head: true,
    })
      .eq('league_id', leagueId)
      .eq('status', 'active');

    const totalBlocks = await getHelper(table.blocks, sql_query.all, {
      count: 'exact',
      head: true,
    }).eq('league_id', leagueId);

    const allMatches = await getAllMatchesGroupedByMatchAndBlock(leagueId);

    // --- Initialize counters ---
    const blockStats: Record<
      string,
      { completed: number; pending: number; total: number }
    > = {};
    const matchesPerWeek: Record<string, number> = {};

    // --- Loop through blocks dynamically ---
    Object.entries(allMatches).forEach(([, matches], index) => {
      const stats = { completed: 0, pending: 0, total: 0 };

      matches.forEach((match) => {
        // Exclude matches where either team is "blind"
        const team1 = match.team1.name?.toLowerCase() ?? '';
        const team2 = match.team2.name?.toLowerCase() ?? '';
        const isBlindMatch = team1 === 'blind' || team2 === 'blind';
        if (isBlindMatch) return;

        stats.total++;

        if (match.status === 'completed') {
          stats.completed++;
        } else {
          stats.pending++;
        }

        // 🧩 Count matches per week
        const week = match.week_number || 'unknown';
        matchesPerWeek[week] = (matchesPerWeek[week] || 0) + 1;
      });

      blockStats[index + 1] = stats;
    });

    // --- Compute average matches per week ---
    const totalMatches = Object.values(matchesPerWeek).reduce(
      (sum, val) => sum + val,
      0,
    );
    const totalWeeks = Object.keys(matchesPerWeek).length;
    const averageMatchesPerWeek =
      totalWeeks > 0 ? Math.round(totalMatches / totalWeeks) : 0;

    // --- Return formatted dashboard summary ---
    return {
      total_blocks: totalBlocks?.count ?? 0,
      total_teams: totalTeams,
      total_players: totalPlayers?.count ?? 0,
      blocks: blockStats,
      average_matches_per_week: averageMatchesPerWeek,
    };
  } catch (error) {
    catchError('Error fetching dashboard data:', error);
    return null;
  }
};

/* Fetches and groups match data by block, including team scores and completion status. */
export const getAllMatchesGroupedByMatchAndBlock = async (
  leagueId: string | number,
): Promise<MatchesByBlock> => {
  try {
    const { data, error } = await supabase.rpc('get_full_timetable', {
      p_league_id: leagueId,
    });

    if (error || !data) {
      console.error('Error fetching full timetable:' + error, errorToastStyle);
      return {};
    }

    const blocks: Record<string, Record<number, MatchData>> = {};

    data.forEach((row: any) => {
      const blockId = row.block_id;
      const matchId = row.match_id;

      if (!blocks[blockId]) blocks[blockId] = {};

      // ✅ Initialize match if not exists
      if (!blocks[blockId][matchId]) {
        blocks[blockId][matchId] = {
          match_id: matchId,
          block_id: blockId,
          week_number: row.week_number,
          lane: row.lane,
          hasScore: false,
          status: 'pending',
          team1: {
            id: row.team1_id,
            name: row.team1_name,
            totalHdc: 0,
            scoreEntered: row.team1_name?.toLowerCase() === 'blind',
            players: [],
          },
          team2: {
            id: row.team2_id,
            name: row.team2_name,
            totalHdc: 0,
            scoreEntered: row.team2_name?.toLowerCase() === 'blind',
            players: [],
          },
        };
      }

      const match = blocks[blockId][matchId];
      const teamKey = row.score_team_id === row.team1_id ? 'team1' : 'team2';

      // ✅ If score exists, push player and mark scoreEntered true
      if (row.score_id) {
        const player: PlayerScoreDetails = {
          id: row.player_id,
          name: row.player_name,
          g1: row.g1,
          g2: row.g2,
          g3: row.g3,
          scratch: row.scratch,
          totalWHdc: row.total_hdc,
          hdc: row.hdc,
          avg: row.avg,
        };

        match[teamKey].players.push(player);
        match[teamKey].totalHdc += row.total_hdc || 0;

        // ✅ Mark team as having score
        match[teamKey].scoreEntered = true;
      }
    });

    // ✅ Update hasScore for each match
    Object.values(blocks).forEach((matches) => {
      Object.values(matches).forEach((match) => {
        const t1 = match.team1.scoreEntered;
        const t2 = match.team2.scoreEntered;
        match.hasScore = t1 && t2;
        match.status = match.hasScore ? 'completed' : 'pending';
      });
    });

    return Object.fromEntries(
      Object.entries(blocks).map(([blockId, matches]) => [
        `block${blockId}`,
        Object.values(matches),
      ]),
    );
  } catch (err) {
    catchError('Unexpected error:', err);
    return {};
  }
};

/* Fetches handicap settings for a league, sorted by average in ascending order. */
export const getHandicapSettings = async (
  leagueId: string | number,
): Promise<HandicapSetting[]> => {
  try {
    const { data, error } = await getHelper(
      table.handicapSettings,
      'id, league_id, average, men_handicap, women_handicap, created_at, updated_at',
    )
      .eq('league_id', leagueId)
      .order('average', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as unknown as HandicapSetting[];
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Unable to load handicap settings.');
  }
};

/* Fetches a league's maximum handicap configuration, if one exists. */
export const getLeagueHandicapConfig = async (
  leagueId: string | number,
): Promise<LeagueHandicapConfig | null> => {
  try {
    const { data, error } = await getHelper(
      'league_handicap_config',
      'id, league_id, men_max_handicap, women_max_handicap, created_at, updated_at',
    )
      .eq('league_id', leagueId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data ?? null) as unknown as LeagueHandicapConfig | null;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Unable to load league handicap configuration.');
  }
};

/* Fetches teams and their members for a league, sorted alphabetically by team name. */
export const getTeamsWithMembersByLeague = async (
  leagueId: string | number | null,
): Promise<LeagueTeamWithMembers[]> => {
  if (leagueId === null) return [];

  try {
    const { data, error } = await getHelper(
      table.teams,
      'id, name, league_id, notes, created_at, updated_at, members:players(id, name, team_id, league_id, type, status, notes, position, created_at, updated_at)',
    )
      .eq('league_id', leagueId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []) as unknown as LeagueTeamWithMembers[];
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Unexpected error while fetching teams and members.');
  }
};

/* Fetches all blocks for a league, sorted by block number. */
export const getBlocksByLeague = async (
  leagueId: string | number | null,
): Promise<LeagueBlock[]> => {
  if (leagueId === null) return [];

  try {
    const { data, error } = await getHelper(
      table.blocks,
      'id, number, league_id',
    )
      .eq('league_id', leagueId)
      .order('number', { ascending: true });

    if (error) {
      toast.error('Error fetching blocks: ' + error.message, errorToastStyle);
      return [];
    }

    return (data || []) as unknown as LeagueBlock[];
  } catch (err) {
    catchError('Error fetching blocks: ', err);
    return [];
  }
};

/* Fetches all teams in a league, sorted alphabetically by name. */
export const getTeamsByLeague = async (
  leagueId: string | number | null,
): Promise<LeagueTeam[]> => {
  if (leagueId === null) return [];

  try {
    const { data, error } = await getHelper(
      table.teams,
      'id, name, league_id, notes, created_at, updated_at',
    )
      .eq('league_id', leagueId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []) as unknown as LeagueTeam[];
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Unexpected error while fetching teams.');
  }
};
