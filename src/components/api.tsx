import {
  sql_query,
  table
} from './constant';
import {
  catchError,
  errorToastStyle,
  handleGetActivePlayersForTeam,
  successToastStyle
} from "./functions";
import { toast } from 'sonner';
import { MatchData, PlayerScoreDetails } from './interfaces';
import { supabase } from '../utils/supabaseClient';

/* SUPABASE HELPER */
const getHelper = (table: string, query: string, options?: any) => {
  return supabase.from(table).select(query, options);
}

const insertHelper = (table: string, values: any) => {
  return supabase.from(table).insert(values);
};

const updateHelper = (table: string, values: any) => {
  return supabase.from(table).update(values);
};

const deleteHelper = (table: string, options?: any) => {
  return supabase.from(table).delete();
};

/* --- LOGIN --- */
export const loginUser = async (
  username: string,
  password: string
): Promise<any | null> => {
  try {
    const { data, error } = await getHelper(table.user, sql_query.all)
      .eq('user_name', username)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Supabase login error:', error.message, errorToastStyle);
      return null;
    }

    return data;
  } catch (err) {
    catchError('Login failed: ', err);
    return null;
  }
};

/* --- GET LEAGUES LIST BY USERID--- */
export const getLeaguesByUser = async (
  userId: any
) => {
  try {
    let query = getHelper(table.leagues, sql_query.all);

    if (userId !== 1) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
  
    if (error) {
      toast.error('Error fetching leagues: ' + error.message, errorToastStyle);
      return [];
    }
  
    return data || [];
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- GET BLOCKS BY LEAGUE ID --- */
export const checkIfLeagueHasBlocks = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.blocks, sql_query.all)
      .eq('league_id', leagueId);

    if (error) {
      toast.error('Error checking league blocks: ' + error.message, errorToastStyle);
      return false;
    }

    if (data && data.length > 0) {
      return true;
    }

    return false;
  } catch (err) {
    catchError('Error checking league blocks:', err);
  }
};

/* --- GET TEAMS AND PLAYERS --- */
export const fetchTeamsAndPlayers = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(
      table.teams,
      `
        id,
        name,
        players (
          id,
          name,
          status
        )
      `
    ).eq('league_id', leagueId)
    .order('name', { ascending: true })
    .order('name', { ascending: true, foreignTable: table.players });

    if (error) {
      toast.error('Error fetching teams: ' + error.message, errorToastStyle);
      return [];
    }

    return data;
  } catch (err) {
    catchError('Error fetching teams and players', err);
    return [];
  }
};

/* --- GET ALL BLOCK --- */
export const fetchBlocksData = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.blocks, sql_query.all)
      .eq('league_id', leagueId);

    if (error) {
      toast.error('Error fetching blocks: ' + error.message, errorToastStyle);
      return [];
    }
    return data || [];
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- GET All TEAM ONLY --- */
export const fetchAllTeams = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.teams, sql_query.all)
      .eq('league_id', leagueId)
      .order('name', { ascending: true });

    if (error) {
      toast.error('Error fetching teams: ' + error.message, errorToastStyle);
      return [];
    }
    return data || [];
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- Get All MATCH [Grouped by Match & Block] --- */
export const fetchAllMatchesGroupedByMatchAndBlock = async (): Promise<any> => {
   try {
    const { data, error } = await supabase.rpc('get_full_timetable');

    if (error) {
      console.error('Error fetching full timetable:' + error, errorToastStyle);
      return { block1: [], block2: [] };
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
      });
    });

    // ✅ Convert blocks to arrays
    const result = {
      block1: Object.values(blocks['1'] || {}),
      block2: Object.values(blocks['2'] || {}),
    };

    console.log(result);
    return result;
  } catch (err) {
    catchError('Unexpected error:', err);
    return { block1: {}, block2: {} };
  }
};

/* --- GET WEEKS BY BLOCKS --- */
export const fetchWeeksByBlocks = async (
  blockNumber: number,
  selectedLeague: any
) => {
  try {
    const { data, error } = await getHelper(table.timetable, 'week_number')
      .eq('block_id', blockNumber)
      .eq('league_id', selectedLeague)
      .order('week_number', { ascending: true });

    if (error) {
      toast.error('Error fetching available weeks: ' + error.message, errorToastStyle);
      return [];
    }

    const uniqueWeeks = Array.from(new Set((data || []).map((item: any) => item.week_number))).sort(
      (a, b) => a - b
    );

    return uniqueWeeks;
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- GET ALL MATCHES BY WEEK AND BLOCK --- */
export const fetchAllMatchesDataByWeekAndBlock = async (
  week: string,
  blockNumber: number,
  selectedLeague: any
) => {
  try {
    if (!week) return [];

    // ✅ Fetch matches with nested teams, players, and weekly_scores (ordered properly)
    const { data, error } = await getHelper(table.timetable,
      `
        id,
        week_number,
        lane,
        block:blocks ( id, number ),
        team1:teams!team1_id (
          id,
          name,
          players (
            id,
            name,
            weekly_scores (
              id,
              match_id,
              player_id,
              team_id,
              g1,
              g2,
              g3,
              scratch,
              hdc,
              avg,
              total_hdc
            )
          )
        ),
        team2:teams!team2_id (
          id,
          name,
          players (
            id,
            name,
            weekly_scores (
              id,
              match_id,
              player_id,
              team_id,
              g1,
              g2,
              g3,
              scratch,
              hdc,
              avg,
              total_hdc
            )
          )
        )
      `)
      .eq("block_id", blockNumber)
      .eq("week_number", week)
      .eq("league_id", selectedLeague)
      .order("lane", { ascending: true })
      .order("id", { ascending: true }) // top-level match order
      // ✅ order weekly_scores within players by ID ASC
      .order("id", { ascending: true, foreignTable: "team1.players.weekly_scores" })
      .order("id", { ascending: true, foreignTable: "team2.players.weekly_scores" })
      // ✅ also order players by ID ASC to ensure consistent player listing
      .order("id", { ascending: true, foreignTable: "team1.players" })
      .order("id", { ascending: true, foreignTable: "team2.players" });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // 2️⃣ Transform the data
    const matches = data.map((row: any) => {
      const formatTeam = (team: any) => {
        const players = (team?.players || []).map((player: any) => {
          const sortedScores = (player.weekly_scores || []).sort(
            (a: any, b: any) => a.id - b.id
          );

          const score =
            player.weekly_scores?.find((s: any) => s.match_id === row.id) || {};

          return {
            id: player.id,
            name: player.name,
            g1: score.g1 || 0,
            g2: score.g2 || 0,
            g3: score.g3 || 0,
            scratch: score.scratch || 0,
            hdc: score.hdc || 0,
            avg: score.avg || 0,
            totalHdc: score.total_hdc || 0,
          };
        });

        players.sort((a: any, b: any) => {
          const scoreA = (team.players.find((p: any) => p.id === a.id)?.weekly_scores?.[0]?.id) || 0;
          const scoreB = (team.players.find((p: any) => p.id === b.id)?.weekly_scores?.[0]?.id) || 0;
          return scoreA - scoreB;
        });

        const scoreEntered =
          team.name?.toLowerCase() === "blind" ||
          players.some(
            (p: any) =>
              p.g1 > 0 ||
              p.g2 > 0 ||
              p.g3 > 0 ||
              p.scratch > 0 ||
              p.hdc > 0 ||
              p.avg > 0 ||
              p.totalHdc > 0
          );

        const totalHdc = players.reduce(
          (sum: any, p: any) => sum + (p.totalHdc || 0),
          0
        );

        return {
          id: team?.id,
          name: team?.name,
          totalHdc,
          players,
          hasScore: scoreEntered,
          scoreEntered,
        };
      };

      const team1 = formatTeam(row.team1);
      const team2 = formatTeam(row.team2);

      const hasScore = team1?.scoreEntered && team2?.scoreEntered;

      return {
        match_id: row.id,
        block_id: row.block?.id,
        week_number: row.week_number,
        lane: row.lane,
        hasScore,
        team1,
        team2,
      };
    });

    console.log(matches);
    return matches;
  } catch (err: any) {
    catchError("Unexpected error:", err);
    return [];
  }
};




/* --- Get Dashboard Data --- */
export const fetchDashboardData = async (
  leagueId: any
) => {
  try {
    const totalTeams = await getHelper(table.teams, sql_query.all,  { count: 'exact', head: true})
      .eq('league_id', leagueId);

    const totalPlayers = await getHelper(table.players, sql_query.all, { count: 'exact', head: true })
      .eq('league_id', leagueId)
      .eq('status', 'active');

    const totalBlocks = await getHelper(table.blocks, sql_query.all, { count: 'exact', head: true })
      .eq('league_id', leagueId);

// // Fetch timetable data (matches)
//     const timetable = await getHelper(table.timetable, '*', { count: 'exact' });

//     // Calculate block progress
//     const blockStats: Record<number, { completed: number; scheduled: number }> = {};

//     timetable?.data?.forEach((match: any) => {
//       const blockId = match.block_id;
//       if (!blockStats[blockId]) {
//         blockStats[blockId] = { completed: 0, scheduled: 0 };
//       }
//       blockStats[blockId].scheduled += 1;

//       // Assuming 'completed' is a boolean or a match has a score recorded
//       if (match.completed || match.score_recorded) {
//         blockStats[blockId].completed += 1;
//       }
//     });
//     console.log({
//       total_teams: (totalTeams?.count ?? 0) - 1,
//       total_players: totalPlayers?.count,
//       block1_completed: blockStats[1]?.completed ?? 0,
//       block1_scheduled: blockStats[1]?.scheduled ?? 0,
//       block2_completed: blockStats[2]?.completed ?? 0,
//       block2_scheduled: blockStats[2]?.scheduled ?? 0,
//     });

//     return {
//       total_teams: (totalTeams?.count ?? 0) - 1,
//       total_players: totalPlayers?.count,
//       block1_completed: blockStats[1]?.completed ?? 0,
//       block1_scheduled: blockStats[1]?.scheduled ?? 0,
//       block2_completed: blockStats[2]?.completed ?? 0,
//       block2_scheduled: blockStats[2]?.scheduled ?? 0,
//     };

    // const blockProgress = await supabase.from(timetable_table).select(query_select_all);

    // console.log(blockProgress.data)
    // const blockStats: Record<number, { completed: number; scheduled: number }> = {};
    // blockProgress.data.forEach((block) => {
    //   blockStats[block.id] = {
    //     completed: block.completed,
    //     scheduled: block.scheduled,
    //   };
    // });
    // const [blocks, leagues, players, teams, timetable, weeklyScores] = await Promise.all([
    //   supabase.from(blocks_table).select('*',  { count: 'exact', head: true }),
    //   supabase.from(leagues_table).select('*',  { count: 'exact', head: true }),
    //   supabase.from(players_table).select('*',  { count: 'exact', head: true }),
    //   supabase.from(teams_table).select('*',  { count: 'exact', head: true }),
    //   supabase.from(timetable_table).select('*',  { count: 'exact', head: true }),
    //   supabase.from(weekly_scores_table).select('*',  { count: 'exact', head: true }),
    // ]);

    console.log({
      total_blocks: totalBlocks?.count,
    // //   leagues: leagues.data,
      total_teams: (totalTeams?.count ?? 0) - 1,
      total_players: totalPlayers?.count,
    // //   timetable: timetable.data,
    // //   weeklyScores: weeklyScores.data,
    })

    return {
      total_blocks: totalBlocks?.count,
    // //   leagues: leagues.data,
      total_teams: (totalTeams?.count ?? 0) - 1,
      total_players: totalPlayers?.count,
    // //   timetable: timetable.data,
    // //   weeklyScores: weeklyScores.data,
    };
  } catch (error) {
    catchError('Error fetching dashboard data:', error);
    return null;
  }
};

/* --- ADD BLOCK FOR A LEAGUE --- */
export const insertBlockForLeague = async (leagueId: any, count: number) => {
  try {
    const blocks = Array.from({ length: count }, (_, i) => ({
      league_id: leagueId,
      number: i + 1,
    }));

    const { error } = await insertHelper(table.blocks, blocks);

    if (error) {
      toast.error('Error inserting league blocks: ' + error.message, errorToastStyle);
      return false;
    }

    return true;
  } catch (err) {
    catchError('Error inserting league blocks:', err);
    return null;
  }
};

/* --- ADD TEAM --- */
export const addTeam = async (
  e: React.FormEvent,
  newTeamName: string,
  selectedLeagueId: any,
  setIsAddingTeam: (value: boolean) => void,
  setNewTeamName: (value: string) => void,
  setTeams: (teams: any[]) => void
) => {
  e.preventDefault();
  if (!newTeamName.trim()) {
    toast.error('Please enter a team name.', errorToastStyle);
    return;
  }

  setIsAddingTeam(true);

  try {
    const { error } = await insertHelper(table.teams, [{ name: newTeamName, league_id: selectedLeagueId }]);

    if (error) {
      toast.error('Error adding team: ' + error.message, errorToastStyle);
      return;
    }

    const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
    setTeams(updatedTeams);

    toast.success(`${newTeamName} added successfully!`, successToastStyle);

    setNewTeamName('');
  } catch (err) {
    catchError('Error adding team:', err);
  } finally {
    setIsAddingTeam(false);
  }
};

/* --- ADD PLAYER(s) --- */
export const addPlayer = (
  e: React.FormEvent,
  mode: 'single' | 'multiple',
  selectedTeam: any | null,
  selectedTeamName: string,
  newPlayerName: string,
  multiplePlayerNames: string,
  setNewPlayerName: (value: string) => void,
  setMultiplePlayerNames: (value: string) => void,
  setDialogOpen: (value: boolean) => void,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any,
) => {
  e.preventDefault();

  const addPlayers = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team first.', errorToastStyle);
      return;
    }

    try {
      if (mode === 'single') {
        if (!newPlayerName.trim()) {
          toast.error('Please enter a player name.', errorToastStyle);
          return;
        }

        const { error } = await insertHelper(table.players, [{ name: newPlayerName, team_id: selectedTeam, status: 'active' }]);

        if (error) {
          toast.error('Error adding player: ' + error.message, errorToastStyle);
          return;
        }

        const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
        setTeams(updatedTeams);
        toast.success(`${newPlayerName} of ${selectedTeamName} added successfully!`, successToastStyle);

        setNewPlayerName('');
      } else {
        if (!multiplePlayerNames.trim()) {
          toast.error('Please enter at least one name.', errorToastStyle);
          return;
        }

        const names = multiplePlayerNames
          .split('\n')
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        if (names.length === 0) {
          toast.error('No valid names provided.', errorToastStyle);
          return;
        }

        const playersToInsert = names.map((name) => ({
          name,
          team_id: selectedTeam,
          status: 'active',
        }));

        const { error } = await insertHelper(table.players, playersToInsert);

        if (error) {
          toast.error('Error adding players: ' + error.message, errorToastStyle);
          return;
        }

        const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
        setTeams(updatedTeams);
        toast.success(`Multiple players of ${selectedTeamName} added successfully!`, successToastStyle);

        setMultiplePlayerNames('');
      }
    } catch (err) {
      catchError('Error adding player(s):', err);
    } finally {
      setDialogOpen(false);
    }
  };

  addPlayers();
};

/* --- ADD MATCH --- */
export const addMatch = async (
  e: React.FormEvent,
  blockNumber: number,
  week: string,
  team1: string,
  team2: string,
  selectedLane: string,
  currentWeek: number,
  refreshMatches: () => Promise<void>,
  setWeek: (val: string) => void,
  setTeam1: (val: string) => void,
  setTeam2: (val: string) => void,
  setSelectedLane: (val: string) => void,
  selectedLeagueId: any
) => {
  e.preventDefault();
  
  if (
    !blockNumber ||
    !week ||
    !team1 ||
    !team2 ||
    !selectedLane
  ) {
    toast.error('Please fill all fields correctly', errorToastStyle);
    return;
  }

  if (team1 === team2) {
    toast.error("Team 1 and Team 2 cannot be the same", errorToastStyle);
    return;
  }

  
  try {
    const { error } = await insertHelper(table.timetable, {
      block_id: blockNumber,
      week_number: parseInt(week),
      team1_id: parseInt(team1),
      team2_id: parseInt(team2),
      lane: selectedLane,
      league_id: selectedLeagueId
    })

    if (error) {
      toast.error('Error adding match: ' + error.message, errorToastStyle);
    }
    
    toast.success('Match added!', successToastStyle);

    await refreshMatches();

    setWeek((currentWeek).toString());
    setTeam1('');
    setTeam2('');
    setSelectedLane('');
  } catch (err) {
    catchError('Error adding match:', err);
  }
};

/* --- INSERT MATCHES RESULTS --- */
export const insertMatchResults = async (
  matchIndex: number,
  match: any,
  scores: any,
  setScores: any,
  fetchAllMatchesDataWithScoresByWeekAndBlock: (week: any, block: any) => Promise<void>,
  selectedWeek: any,
  selectedBlock: number,
  setIsLoadingSkeleton: any,
  activePlayers: any,
  leagueId: any
) => {
  try {
    const allScores: any[] = [];

    const team1Players = handleGetActivePlayersForTeam(matchIndex, 1, match.team1, activePlayers) || [];
    const team2Players = handleGetActivePlayersForTeam(matchIndex, 2, match.team2, activePlayers) || [];

    // Only process team1 if it has players
    if (team1Players.length > 0) {
      const team1Scores = team1Players.map((player: any) => {
        const pScores = scores[matchIndex]?.team1?.[player.id] || {};
        const g1 = parseInt(pScores.game1) || 0;
        const g2 = parseInt(pScores.game2) || 0;
        const g3 = parseInt(pScores.game3) || 0;
        const hdc = parseInt(pScores.hdc) || 0;
        const scratch = g1 + g2 + g3;
        const totalHdc = scratch + hdc;

        return {
          match_id: match.match_id,
          player_id: player.id,
          g1,
          g2,
          g3,
          scratch,
          hdc,
          total_hdc: totalHdc,
          avg: +(scratch / 3).toFixed(2),
          team_id: match.team1.id,
          league_id: leagueId,
          created_at: new Date().toISOString()
        };
      });
      allScores.push(...team1Scores);
    }

    // Only process team2 if it has players
    if (team2Players.length > 0) {
      const team2Scores = team2Players.map((player: any) => {
      const pScores = scores[matchIndex]?.team2?.[player.id] || {};
      const g1 = parseInt(pScores.game1) || 0;
      const g2 = parseInt(pScores.game2) || 0;
      const g3 = parseInt(pScores.game3) || 0;
      const hdc = parseInt(pScores.hdc) || 0;
      const scratch = g1 + g2 + g3;
      const totalHdc = scratch + hdc;

        return {
          match_id: match.match_id,
          player_id: player.id,
          g1,
          g2,
          g3,
          scratch,
          hdc,
          total_hdc: totalHdc,
          avg: +(scratch / 3).toFixed(2),
          team_id: match.team2.id,
          league_id: leagueId,
          created_at: new Date().toISOString()
        };
      });
      allScores.push(...team2Scores);
    }

    if (allScores.length === 0) {
      toast.error('No players to save for this match.', errorToastStyle);
      return;
    }

    const { error } = await insertHelper(table.weeklyScore, allScores);


    if (error) {
      toast.error('Error saving scores: ' + error.message, errorToastStyle);
    }

    toast.success('Scores saved successfully!', successToastStyle);

    setScores((prev: any) => {
      const newScores = { ...prev };
      delete newScores[matchIndex];
      return newScores;
    });

    setIsLoadingSkeleton(true);
    await fetchAllMatchesDataWithScoresByWeekAndBlock(selectedWeek, selectedBlock);
    setIsLoadingSkeleton(false);
  } catch (err: any) {
    catchError('Error saving scores:', err);
  }
};

/* --- DELETE TEAM --- */
export const deleteTeam = async (
  teamId: string,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any
) => {
  try {
    const { error } = await deleteHelper(table.teams).eq('id', teamId);

    if (error) {
      toast.error('Error deleting team: ' + error.message, errorToastStyle);
      return;
    }

    toast.success('Team deleted successfully!', successToastStyle);

    const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
    setTeams(updatedTeams);
  } catch (err) {
    catchError('Error deleting team: ', err);
  }
};

/* --- DELETE PLAYER --- */
export const deletePlayer = async (
  playerId: string,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any
) => {
  try {
    const { error } = await deleteHelper(table.players).eq('id', playerId);

    if (error) {
      toast.error('Error deleting player: ' + error.message, errorToastStyle);
      return;
    }

    toast.success('Player deleted successfully!', successToastStyle);

    const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
    setTeams(updatedTeams);
  } catch (err) {
    catchError('Error deleting player: ', err);
  }
};

/* --- Delete Match --- */
export const deleteMatch = async (
  matchId: number,
  refreshMatches: () => Promise<void>
) => {
  if (!matchId) {
    toast.error('Invalid match selected', errorToastStyle);
    return;
  }

  try {
    const { error } = await deleteHelper(table.timetable, { id: matchId });

    if (error) {
      toast.error('Error deleting match: ' + error.message, errorToastStyle);
      return;
    }

    toast.success('Match deleted successfully!', successToastStyle);
    await refreshMatches();
  } catch (err) {
    catchError('Error deleting match:', err);
  }
};

/* --- EDIT PLAYER --- */
export const updatePlayer = async (
  playerId: number,
  newName: string,
  newStatus: string,
  selectedLeagueId: any,
  setTeams: (teams: any[]) => void
) => {
  try {
    const { error } = await updateHelper(table.players, {
        name: newName,
        status: newStatus,
      })
      .eq('id', playerId);

    if (error) {
      toast.error('Error updating player: ' + error.message, errorToastStyle);
      return false;
    }

    toast.success('Player updated successfully!', successToastStyle);

    const updatedTeams = await fetchTeamsAndPlayers(selectedLeagueId);
    setTeams(updatedTeams);
    
    return true;
  } catch (err) {
    catchError('Error updating player: ', err);
  }
};
