import { toast } from "sonner";
import { sql_query, table } from "../constant";
import { catchError, errorToastStyle } from "../functions";
import { getHelper } from "./supabaseHelper";
import { supabase } from "../../utils/supabaseClient";
import { MatchData, PlayerScoreDetails } from "../interfaces";

/* --- LOGIN --- */
export const loginUser = async (
  username: string,
  password: string
): Promise<any | null> => {
  try {
    const { data, error } = await getHelper(table.user, sql_query.all)
      .eq("user_name", username)
      .eq("password", password)
      .single();

    if (error) {
      console.error("Supabase login error:", error.message, errorToastStyle);
      return null;
    }

    return data;
  } catch (err) {
    catchError("Login failed: ", err);
    return null;
  }
};

/* --- GET LEAGUES LIST BY USERID--- */
export const getLeaguesByUser = async (userId: any) => {
  try {
    let query = getHelper(table.leagues, sql_query.all);

    if (userId !== 1) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Error fetching leagues: " + error.message, errorToastStyle);
      return [];
    }

    return data || [];
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET BLOCKS BY LEAGUE ID --- */
export const checkIfLeagueHasBlocks = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.blocks, sql_query.all).eq(
      "league_id",
      leagueId
    );

    if (error) {
      toast.error(
        "Error checking league blocks: " + error.message,
        errorToastStyle
      );
      return false;
    }

    if (data && data.length > 0) {
      return true;
    }

    return false;
  } catch (err) {
    catchError("Error checking league blocks:", err);
  }
};

/* --- Get Dashboard Data --- */
export const getDashboardDataByLeagueId = async (leagueId: any) => {
  try {
    const { data } = await getHelper(table.teams, sql_query.all, {
      count: "exact",
    }).eq("league_id", leagueId);

    const totalTeams = (data || []).filter(
      (team: any) => team.name?.toLowerCase() !== "blind"
    ).length;

    const totalPlayers = await getHelper(table.players, sql_query.all, {
      count: "exact",
      head: true,
    })
      .eq("league_id", leagueId)
      .eq("status", "active");

    const totalBlocks = await getHelper(table.blocks, sql_query.all, {
      count: "exact",
      head: true,
    }).eq("league_id", leagueId);

    const allMatches = await getAllMatchesGroupedByMatchAndBlock(leagueId);

    // --- Initialize counters ---
    const blockStats: Record<
      string,
      { completed: number; pending: number; total: number }
    > = {};
    const matchesPerWeek: Record<string, number> = {};

    // --- Loop through blocks dynamically ---
    Object.entries(allMatches as Record<string, any[]>).forEach(
      ([blockKey, matches]) => {
        if (!Array.isArray(matches)) return;

        const stats = { completed: 0, pending: 0, total: matches.length };

        matches.forEach((match) => {
          // Exclude matches where either team is "blind"
          const team1 = match.team1_name?.toLowerCase() ?? "";
          const team2 = match.team2_name?.toLowerCase() ?? "";
          const isBlindMatch = team1 === "blind" || team2 === "blind";
          if (isBlindMatch) return;

          if (match.status === "completed") stats.completed++;
          else stats.pending++;

          // 🧩 Count matches per week
          const week = match.week_number || "unknown";
          matchesPerWeek[week] = (matchesPerWeek[week] || 0) + 1;
        });

        blockStats[blockKey] = stats;
      }
    );

    // --- Compute average matches per week ---
    const totalMatches = Object.values(matchesPerWeek).reduce(
      (sum, val) => sum + val,
      0
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
    catchError("Error fetching dashboard data:", error);
    return null;
  }
};

/* --- Get All MATCH [Grouped by Match & Block] --- */
export const getAllMatchesGroupedByMatchAndBlock = async (
  leagueId: any
): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc("get_full_timetable", {
      p_league_id: leagueId,
    });

    if (error) {
      console.error("Error fetching full timetable:" + error, errorToastStyle);
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
          status: "pending",
          team1: {
            id: row.team1_id,
            name: row.team1_name,
            totalHdc: 0,
            scoreEntered: row.team1_name?.toLowerCase() === "blind",
            players: [],
          },
          team2: {
            id: row.team2_id,
            name: row.team2_name,
            totalHdc: 0,
            scoreEntered: row.team2_name?.toLowerCase() === "blind",
            players: [],
          },
        };
      }

      const match = blocks[blockId][matchId];
      const teamKey = row.score_team_id === row.team1_id ? "team1" : "team2";

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
        match.status = match.hasScore ? "completed" : "pending";
      });
    });

    // ✅ Convert blocks to arrays
    const result = {
      block1: Object.values(blocks["1"] || {}),
      block2: Object.values(blocks["2"] || {}),
    };

    return result;
  } catch (err) {
    catchError("Unexpected error:", err);
    return { block1: {}, block2: {} };
  }
};

/* --- GET TEAMS AND PLAYERS --- */
export const getTeamsAndPlayersByLeagueId = async (leagueId: any) => {
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
    )
      .eq("league_id", leagueId)
      .order("name", { ascending: true })
      .order("name", { ascending: true, foreignTable: table.players });

    if (error) {
      toast.error("Error fetching teams: " + error.message, errorToastStyle);
      return [];
    }

    return data;
  } catch (err) {
    catchError("Error fetching teams and players", err);
    return [];
  }
};

/* --- GET ALL BLOCKS --- */
export const getAllBlocksByLeagueId = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.blocks, sql_query.all).eq(
      "league_id",
      leagueId
    );

    if (error) {
      toast.error("Error fetching blocks: " + error.message, errorToastStyle);
      return [];
    }
    return data || [];
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET All TEAMS --- */
export const getAllTeamsByLeagueId = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.teams, sql_query.all)
      .eq("league_id", leagueId)
      .order("name", { ascending: true });

    if (error) {
      toast.error("Error fetching teams: " + error.message, errorToastStyle);
      return [];
    }
    return data || [];
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET ALL LANES BY LEAGUE ID --- */
export const getAllLanesByLeagueId = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.lanes, sql_query.all)
      .eq("league_id", leagueId)
      .order("id", { ascending: true });
    if (error) {
      toast.error("Error fetching lanes: " + error.message, errorToastStyle);
      return [];
    }

    return data || [];
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET ALL MATCHES BY WEEK AND BLOCK --- */
export const getAllMatchesDataByWeekAndBlock = async (
  week: string,
  blockNumber: number,
  selectedLeague: any
) => {
  try {
    if (!week) return [];

    const { data, error } = await getHelper(
      table.timetable,
      `
        id,
        week_number,
        lane:lanes!lane_id ( id, lane ),
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
              total_hdc,
              order_index
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
              total_hdc,
              order_index
            )
          )
        )
      `
    )
      .eq("block_id", blockNumber)
      .eq("week_number", week)
      .eq("league_id", selectedLeague)
      .order("id", { ascending: true })
      .order("lane", { ascending: true, foreignTable: "lane" })
      .order("id", {
        ascending: true,
        foreignTable: "team1.players.weekly_scores",
      })
      .order("id", {
        ascending: true,
        foreignTable: "team2.players.weekly_scores",
      })
      .order("id", { ascending: true, foreignTable: "team1.players" })
      .order("id", { ascending: true, foreignTable: "team2.players" });

    if (error) throw error;
    if (!data || data.length === 0) return [];

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
            order_index: score.order_index ?? null,
          };
        });

        // ✅ Sort by order_index if exists, else fallback to id
        players.sort((a: any, b: any) => {
          const orderA = a.order_index ?? a.id;
          const orderB = b.order_index ?? b.id;
          return orderA - orderB;
        });

        const scoreEntered =
          team.name?.toLowerCase() === "blind" ||
          players.some(
            (p: any) =>
              p.g1 > 0 || p.g2 > 0 || p.g3 > 0 || p.scratch > 0 || p.hdc > 0
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
        lane: row.lane?.lane,
        hasScore,
        team1,
        team2,
      };
    });

    return matches;
  } catch (err: any) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET WEEKS BY BLOCKS --- */
export const getWeeksByBlocks = async (
  blockNumber: number,
  selectedLeague: any
) => {
  try {
    const { data, error } = await getHelper(table.timetable, "week_number")
      .eq("block_id", blockNumber)
      .eq("league_id", selectedLeague)
      .order("week_number", { ascending: true });

    if (error) {
      toast.error(
        "Error fetching available weeks: " + error.message,
        errorToastStyle
      );
      return [];
    }

    const uniqueWeeks = Array.from(
      new Set((data || []).map((item: any) => item.week_number))
    ).sort((a, b) => a - b);

    return uniqueWeeks;
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET ALL PLAYERS --- */
export const getAllPlayersByLeagueId = async (leagueId: any) => {
  try {
    const { data, error } = await getHelper(table.players, sql_query.all).eq(
      "league_id",
      leagueId
    );

    if (error) {
      toast.error("Error fetching players: " + error.message, errorToastStyle);
      return [];
    }
    return data || [];
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET ALL WEEKS OR BY BLOCK --- */
export const getAllWeeksOrByBlock = async (blockNumber: any, leagueId: any) => {
  try {
    if (blockNumber == "all") {
      const { data, error } = await getHelper(table.timetable, "week_number")
        .select("week_number")
        .eq("league_id", leagueId)
        .order("week_number", { ascending: true });

      if (error) {
        toast.error(
          "Error fetching available weeks: " + error.message,
          errorToastStyle
        );
        return [];
      }

      const uniqueWeeks = Array.from(
        new Set((data || []).map((item: any) => item.week_number))
      ).sort((a, b) => a - b);

      return uniqueWeeks;
    } else {
      const { data, error } = await getHelper(table.timetable, "week_number")
        .eq("block_id", blockNumber)
        .eq("league_id", leagueId)
        .order("week_number", { ascending: true });

      if (error) {
        toast.error(
          "Error fetching available weeks: " + error.message,
          errorToastStyle
        );
        return [];
      }

      const uniqueWeeks = Array.from(
        new Set((data || []).map((item: any) => item.week_number))
      ).sort((a, b) => a - b);

      return uniqueWeeks;
    }
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

/* --- GET ALL WEEKLY SCORES --- */
export const getAllWeeklyScores = async (leagueId: any) => {
  try {
    const { data: scoresData, error } = await supabase
      .from("weekly_scores")
      .select(
        `
      id,
      match_id,
      player_id,
      team_id,
      g1,
      g2,
      g3,
      scratch,
      hdc,
      total_hdc,
      avg,
      created_at,
      player:players (name),
      team:teams (name),
      timetable:timetable (week_number, block_id)
    `
      )
      .eq("league_id", leagueId);

    // Flatten the player and team names
    const flatData = scoresData?.map((row: any) => ({
      id: row.id,
      match_id: row.match_id,
      player_id: row.player_id,
      player_name: row.player?.name ?? null,
      team_id: row.team_id,
      team_name: row.team?.name ?? null,
      g1: row.g1,
      g2: row.g2,
      g3: row.g3,
      scratch: row.scratch,
      hdc: row.hdc,
      total_hdc: row.total_hdc,
      avg: row.avg,
      created_at: row.created_at,
      week_number: row.timetable?.week_number ?? null,
      block_id: row.timetable?.block_id ?? null,
    }));

    return flatData;
  } catch (err) {
    catchError("Unexpected error:", err);
  }
};

/* --- GET PLAYERS BY TEAM ID --- */
export const getPlayersByTeamId = async (teamId: string) => {
  try {
    const { data, error } = await getHelper(table.players, sql_query.all).eq(
      "team_id",
      teamId
    );

    if (error) {
      console.error(
        "Error fetching players by team ID:",
        error,
        errorToastStyle
      );
      return [];
    }

    return data;
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};

export const fetchPlayerWeeklyScores = async (playerId: string) => {
  try {
    const { data, error } = await getHelper(
      table.weeklyScore,
      `
      id,
      match_id,
      player_id,
      team_id,
      g1,
      g2,
      g3,
      scratch,
      hdc,
      total_hdc,
      avg,
      created_at,
      player:players (name),
      team:teams (name)`
    ).eq("player_id", playerId);

    if (error) {
      console.error(
        "Error fetching player weekly scores:",
        error,
        errorToastStyle
      );
      return [];
    }

    const flatData = data?.map((row: any) => ({
      avg: row.avg,
      g1: row.g1,
      g2: row.g2,
      g3: row.g3,
      hdc: row.hdc,
      id: row.id,
      match_id: row.match_id,
      player_id: row.player_id,
      player_name: row.player?.name ?? null,
      scratch: row.scratch,
      team_id: row.team_id,
      team_name: row.team?.name ?? null,
      total_pins_hdc: row.total_hdc,
    }));

    return flatData;
  } catch (err) {
    catchError("Unexpected error:", err);
    return [];
  }
};
