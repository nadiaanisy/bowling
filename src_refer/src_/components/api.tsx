import {
  blocks_table,
  leagues_table,
  players_table,
  teams_table,
  timetable_table,
  users_table,
  weekly_scores_table,
  query_select_all
} from './data';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { catchError, errorToastStyle, getActivePlayersForTeam, successToastStyle } from './functions';
import { MatchData, PlayerScoreDetails } from './interface';

/* --- Login --- */
export const loginUser = async (user_name: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from("Used")
      .select("*")
      .eq("user_name", user_name)
      .eq("password", password) // check password column
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    if (!data) {
      console.log("User not found or wrong password");
      return null;
    }

    return data; // login successful
  } catch (err) {
    console.error(err);
    return null;
  }
};

/* --- Get League By User --- */
export const getLeaguesByUser = async (userId: number) => {
  const query = supabase.from(leagues_table).select(query_select_all);

  if (userId !== 1) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leagues: " + error, errorToastStyle);
    return [];
  }

  return data;
};


/* --- (League Selection) Get Leagues --- */
export const fetchLeagueList = async () => {
  try {
    const { data, error } = await supabase
      .from(leagues_table)
      .select(query_select_all);

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

/* --- (Teams) Get Teams and Players --- */
export const fetchTeamsAndPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from(teams_table)
      .select(`
        id,
        name,
        players (
          id,
          name
        )
      `);
    
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

/* --- (Teams) Add Team --- */
export const AddTeam = async (
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
    const { error } = await supabase
      .from(teams_table)
      .insert([{ name: newTeamName, league_id: selectedLeagueId }]);

    if (error) {
      toast.error('Error adding team: ' + error.message, errorToastStyle);
      return;
    }

    const updatedTeams = await fetchTeamsAndPlayers();
    setTeams(updatedTeams);

    toast.success(`${newTeamName} added successfully!`, successToastStyle);

    setNewTeamName('');
  } catch (err) {
    catchError('Error adding team:', err);
  } finally {
    setIsAddingTeam(false);
  }
};

/* --- (Teams) Add Player(s) --- */
export const AddPlayer = (
  e: React.FormEvent,
  mode: 'single' | 'multiple',
  selectedTeam: any | null,
  selectedTeamName: string,
  newPlayerName: string,
  multiplePlayerNames: string,
  setNewPlayerName: (value: string) => void,
  setMultiplePlayerNames: (value: string) => void,
  setDialogOpen: (value: boolean) => void,
  setTeams: (teams: any[]) => void
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

        const { error } = await supabase
          .from(players_table)
          .insert([{ name: newPlayerName, team_id: selectedTeam }]);

        if (error) {
          toast.error('Error adding player: ' + error.message, errorToastStyle);
          return;
        }

        const updatedTeams = await fetchTeamsAndPlayers();
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
        }));

        const { error } = await supabase
          .from(players_table)
          .insert(playersToInsert);

        if (error) {
          toast.error('Error adding players: ' + error.message, errorToastStyle);
          return;
        }

        const updatedTeams = await fetchTeamsAndPlayers();
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

/* --- (Teams) Delete Team --- */
export const deleteTeam = async (
  teamId: string,
  setTeams: (teams: any[]) => void
) => {
  try {
    const { error } = await supabase
      .from(teams_table)
      .delete()
      .eq('id', teamId);

    if (error) {
      toast.error('Error deleting team: ' + error.message, errorToastStyle);
      return;
    }

    toast.success('Team deleted successfully!', successToastStyle);

    const updatedTeams = await fetchTeamsAndPlayers();
    setTeams(updatedTeams);
  } catch (err) {
    catchError('Error deleting team: ', err);
  }
};

/* --- (Teams) Delete Player --- */
export const deletePlayer = async (
  playerId: string,
  setTeams: (teams: any[]) => void
) => {
  try {
    const { error } = await supabase
      .from(players_table)
      .delete()
      .eq('id', playerId);

    if (error) {
      toast.error('Error deleting player: ' + error.message, errorToastStyle);
      return;
    }

    toast.success('Player deleted successfully!', successToastStyle);

    const updatedTeams = await fetchTeamsAndPlayers();
    setTeams(updatedTeams);
  } catch (err) {
    catchError('Error deleting player: ', err);
  }
};

/* --- (Timetable) Get List of Blocks  --- */
export const fetchBlocksData = async () => {
  try {
    const { data, error } = await supabase
      .from(blocks_table)
      .select(query_select_all);

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

// /* --- (Timetable)  Add Match --- */
export const AddMatch = async (
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
    const { error } = await supabase
      .from(timetable_table)
      .insert({
        block_id: blockNumber,
        week_number: parseInt(week),
        team1_id: parseInt(team1),
        team2_id: parseInt(team2),
        lane: selectedLane
      });

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

/* --- (Timetable) Get All Teams ONLY --- */
export const fetchAllTeams = async () => {
  try {
    const { data, error } = await supabase
      .from(teams_table)
      .select(query_select_all);

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

/* --- (Timetable) Get All Matches [Grouped by Match & Block] --- */
export const fetchAllMatches = async (): Promise<any> => {
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

      // If match doesn't exist yet, create it
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
            players: [],
          },
          team2: {
            id: row.team2_id,
            name: row.team2_name,
            totalHdc: 0,
            players: [],
          },
        };
      }

      const match = blocks[blockId][matchId];
      const teamKey = row.score_team_id === row.team1_id ? 'team1' : 'team2';

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
      }
    });

    // Update hasScore for each match
    Object.values(blocks).forEach((matches) => {
      Object.values(matches).forEach((match) => {
        match.hasScore = match.team1.totalHdc > 0 && match.team2.totalHdc > 0;
      });
    });

    // Convert blocks to array of matches per block
    const result = {
      block1: Object.values(blocks['1'] || {}),
      block2: Object.values(blocks['2'] || {}),
    };

    return result;
  } catch (err) {
    catchError('Unexpected error:', err);
    return { block1: {}, block2: {} };
  }
};

/* --- (Scores) Fetch weeks By Blocks --- */
export const fetchWeeksByBlocks = async (blockNumber: number) => {
  try {
    const { data, error } = await supabase
      .from(timetable_table)
      .select('week_number')
      .eq('block_id', blockNumber)
      .order('week_number', { ascending: true });

    if (error) {
      toast.error('Error fetching available weeks: ' + error.message, errorToastStyle);
      return [];
    }

    const uniqueWeeks = Array.from(new Set(data.map((item) => item.week_number))).sort(
      (a, b) => a - b
    );

    return uniqueWeeks;
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- Fetch All Matches Data By Week and Block --- */
export const fetchAllMatchesDataByWeekAndBlock = async (
  week: string,
  blockNumber: number
) => {
  try {
    if (!week) return [];

    // 1️⃣ Fetch matches with nested teams, players, and weekly_scores
    const { data, error } = await supabase
      .from("timetable")
      .select(`
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
      .order("lane", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // 2️⃣ Transform into desired shape
    const matches = data.map((row: any) => {
      const formatTeam = (team: any) => {
        const players = (team?.players || []).map((player: any) => {
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

        const hasScore = players.some(
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
          hasScore,
        };
      };

      return {
        match_id: row.id,
        block_id: row.block?.id,
        week_number: row.week_number,
        lane: row.lane,
        hasScore: false,
        team1: formatTeam(row.team1),
        team2: formatTeam(row.team2),
      };
    });

    return matches;
  } catch (err: any) {
    catchError('Unexpected error:', err);
    return [];
  }
};

/* --- Handle Save Matches Scores --- */
export const handleSaveMatch = async (
  matchIndex: number,
  match: any,
  scores: any,
  setScores: any,
  fetchAllMatchesDataWithScoresByWeekAndBlock: (week: any, block: any) => Promise<void>,
  selectedWeek: any,
  selectedBlock: number,
  setIsLoadingSkeleton: any,
  activePlayers: any
) => {
  try {
    const allScores: any[] = [];

    const team1Players = getActivePlayersForTeam(matchIndex, 1, match.team1, activePlayers) || [];
    const team2Players = getActivePlayersForTeam(matchIndex, 2, match.team2, activePlayers) || [];

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
          created_at: new Date().toISOString()
        };
      });
      allScores.push(...team2Scores);
    }

    if (allScores.length === 0) {
      toast.error('No players to save for this match.', errorToastStyle);
      return;
    }

    const { error } = await supabase
      .from(weekly_scores_table)
      .insert(allScores);

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

export const fetchAllWeeksOrByBlock = async (blockNumber: any) => {
  try {
    if (blockNumber == 'all')  {
      const { data, error } = await supabase
        .from(timetable_table)
        .select('week_number')
        .order('week_number', { ascending: true });

        if (error) {
        toast.error('Error fetching available weeks: ' + error.message, errorToastStyle);
        return [];
      }

      const uniqueWeeks = Array.from(new Set(data.map((item) => item.week_number))).sort(
        (a, b) => a - b
      );

      return uniqueWeeks;
    } else {
      const { data, error } = await supabase
        .from(timetable_table)
        .select('week_number')
        .eq('block_id', blockNumber)
        .order('week_number', { ascending: true });

      if (error) {
        toast.error('Error fetching available weeks: ' + error.message, errorToastStyle);
        return [];
      }

      const uniqueWeeks = Array.from(new Set(data.map((item) => item.week_number))).sort(
        (a, b) => a - b
      );

      return uniqueWeeks;
    }
  } catch (err) {
    catchError('Unexpected error:', err);
    return [];
  }
};

// export const fetchAllMatchesDataWithScoresByWeekAndBlock = async (
//   week: string,
//   blockNumber: number
// ) => {
//   try {
//     if (!week) return [];

//     // 1️⃣ Fetch same structure as before
//     const { data, error } = await supabase
//       .from("timetable")
//       .select(`
//         id,
//         week_number,
//         lane,
//         block:blocks ( id, number ),
//         team1:teams!team1_id (
//           id,
//           name,
//           players (
//             id,
//             name,
//             weekly_scores (
//               id,
//               match_id,
//               player_id,
//               team_id,
//               g1,
//               g2,
//               g3,
//               scratch,
//               hdc,
//               avg,
//               total_hdc
//             )
//           )
//         ),
//         team2:teams!team2_id (
//           id,
//           name,
//           players (
//             id,
//             name,
//             weekly_scores (
//               id,
//               match_id,
//               player_id,
//               team_id,
//               g1,
//               g2,
//               g3,
//               scratch,
//               hdc,
//               avg,
//               total_hdc
//             )
//           )
//         )
//       `)
//       .eq("block_id", blockNumber)
//       .eq("week_number", week)
//       .order("lane", { ascending: true });

//     if (error) throw error;
//     if (!data || data.length === 0) return [];

//     // 2️⃣ Transform and filter players that actually have score data
//     const matches = data.map((row: any) => {
//       const formatTeam = (team: any) => {
//         if (!team) return { id: null, name: null, players: [], hasScore: false };

//         // Filter players that have any non-zero score
//         const players = (team.players || [])
//           .map((player: any) => {
//             const score =
//               player.weekly_scores?.find((s: any) => s.match_id === row.id) || {};
//             return {
//               id: player.id,
//               name: player.name,
//               g1: score.g1 || 0,
//               g2: score.g2 || 0,
//               g3: score.g3 || 0,
//               scratch: score.scratch || 0,
//               hdc: score.hdc || 0,
//               avg: score.avg || 0,
//               totalHdc: score.total_hdc || 0,
//             };
//           })
//           .filter(
//             (p: any) =>
//               p.g1 > 0 || p.g2 > 0 || p.g3 > 0 || p.scratch > 0 || p.hdc > 0
//           );

//         const hasScore = players.length > 0;

//         const totalHdc = players.reduce(
//           (sum: any, p: any) => sum + (p.totalHdc || 0),
//           0
//         );

//         return {
//           id: team.id,
//           name: team.name,
//           totalHdc,
//           players,
//           hasScore,
//         };
//       };

//       return {
//         match_id: row.id,
//         block_id: row.block?.id,
//         week_number: row.week_number,
//         lane: row.lane,
//         hasScore: false,
//         team1: formatTeam(row.team1),
//         team2: formatTeam(row.team2),
//       };
//     });

//     console.log("Filtered matches with player scores:", matches);
//     return matches;
//   } catch (err: any) {
//     catchError("Unexpected error:", err);
//     return [];
//   }
// };


