import {
  catchError,
  errorToastStyle,
  handleGetActivePlayersForTeam,
  successToastStyle,
} from "../functions";
import { toast } from "sonner";
import { table } from "../constant";
import { insertHelper } from "./supabaseHelper";
import { getTeamsAndPlayersByLeagueId } from "./get";

/* --- ADD BLOCK FOR A LEAGUE --- */
export const addBlockForLeague = async (leagueId: any, count: number) => {
  try {
    const blocks = Array.from({ length: count }, (_, i) => ({
      league_id: leagueId,
      number: i + 1,
    }));

    const { error } = await insertHelper(table.blocks, blocks);

    if (error) {
      toast.error(
        "Error inserting league blocks: " + error.message,
        errorToastStyle
      );
      return false;
    }

    return true;
  } catch (err) {
    catchError("Error inserting league blocks:", err);
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
    toast.error("Please enter a team name.", errorToastStyle);
    return;
  }

  setIsAddingTeam(true);

  try {
    const { error } = await insertHelper(table.teams, [
      { name: newTeamName, league_id: selectedLeagueId },
    ]);

    if (error) {
      toast.error("Error adding team: " + error.message, errorToastStyle);
      return;
    }

    const updatedTeams = await getTeamsAndPlayersByLeagueId(selectedLeagueId);
    setTeams(updatedTeams);

    toast.success(`${newTeamName} added successfully!`, successToastStyle);

    setNewTeamName("");
  } catch (err) {
    catchError("Error adding team:", err);
  } finally {
    setIsAddingTeam(false);
  }
};

/* --- ADD PLAYER(s) --- */
export const addPlayer = (
  e: React.FormEvent,
  mode: "single" | "multiple",
  selectedTeam: any | null,
  selectedTeamName: string,
  newPlayerName: string,
  multiplePlayerNames: string,
  setNewPlayerName: (value: string) => void,
  setMultiplePlayerNames: (value: string) => void,
  setDialogOpen: (value: boolean) => void,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any
) => {
  e.preventDefault();

  const addPlayers = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team first.", errorToastStyle);
      return;
    }

    try {
      if (mode === "single") {
        if (!newPlayerName.trim()) {
          toast.error("Please enter a player name.", errorToastStyle);
          return;
        }

        const { error } = await insertHelper(table.players, [
          {
            name: newPlayerName,
            team_id: selectedTeam,
            status: "active",
            league_id: selectedLeagueId,
          },
        ]);

        if (error) {
          toast.error("Error adding player: " + error.message, errorToastStyle);
          return;
        }

        const updatedTeams = await getTeamsAndPlayersByLeagueId(
          selectedLeagueId
        );
        setTeams(updatedTeams);
        toast.success(
          `${newPlayerName} of ${selectedTeamName} added successfully!`,
          successToastStyle
        );

        setNewPlayerName("");
      } else {
        if (!multiplePlayerNames.trim()) {
          toast.error("Please enter at least one name.", errorToastStyle);
          return;
        }

        const names = multiplePlayerNames
          .split("\n")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        if (names.length === 0) {
          toast.error("No valid names provided.", errorToastStyle);
          return;
        }

        const playersToInsert = names.map((name) => ({
          name,
          team_id: selectedTeam,
          status: "active",
          league_id: selectedLeagueId,
        }));

        const { error } = await insertHelper(table.players, playersToInsert);

        if (error) {
          toast.error(
            "Error adding players: " + error.message,
            errorToastStyle
          );
          return;
        }

        const updatedTeams = await getTeamsAndPlayersByLeagueId(
          selectedLeagueId
        );
        setTeams(updatedTeams);
        toast.success(
          `Multiple players of ${selectedTeamName} added successfully!`,
          successToastStyle
        );

        setMultiplePlayerNames("");
      }
    } catch (err) {
      catchError("Error adding player(s):", err);
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

  if (!blockNumber || !week || !team1 || !team2 || !selectedLane) {
    toast.error("Please fill all fields correctly", errorToastStyle);
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
      lane_id: selectedLane,
      league_id: selectedLeagueId,
    });

    if (error) {
      toast.error("Error adding match: " + error.message, errorToastStyle);
    }

    toast.success("Match added!", successToastStyle);

    await refreshMatches();

    setWeek(currentWeek.toString());
    setTeam1("");
    setTeam2("");
    setSelectedLane("");
  } catch (err) {
    catchError("Error adding match:", err);
  }
};

/* --- ADD MATCHES RESULTS --- */
export const addMatchResults = async (
  matchIndex: number,
  match: any,
  scores: any,
  setScores: any,
  fetchAllMatchesDataWithScoresByWeekAndBlock: (
    week: any,
    block: any
  ) => Promise<void>,
  selectedWeek: any,
  selectedBlock: number,
  setIsLoadingSkeleton: any,
  activePlayers: any,
  leagueId: any
) => {
  try {
    const allScores: any[] = [];

    const team1Players =
      handleGetActivePlayersForTeam(
        matchIndex,
        1,
        match.team1,
        activePlayers
      ) || [];
    const team2Players =
      handleGetActivePlayersForTeam(
        matchIndex,
        2,
        match.team2,
        activePlayers
      ) || [];

    // ✅ Team 1
    if (team1Players.length > 0) {
      const team1Scores = team1Players.map((player: any, idx: number) => {
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
          order_index: idx, // ✅ store player order
          created_at: new Date().toISOString(),
        };
      });
      allScores.push(...team1Scores);
    }

    // ✅ Team 2
    if (team2Players.length > 0) {
      const team2Scores = team2Players.map((player: any, idx: number) => {
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
          order_index: idx, // ✅ store player order
          created_at: new Date().toISOString(),
        };
      });
      allScores.push(...team2Scores);
    }

    if (allScores.length === 0) {
      toast.error("No players to save for this match.", errorToastStyle);
      return;
    }

    const { error } = await insertHelper(table.weeklyScore, allScores);
    if (error) {
      toast.error("Error saving scores: " + error.message, errorToastStyle);
    }

    toast.success("Scores saved successfully!", successToastStyle);

    setScores((prev: any) => {
      const newScores = { ...prev };
      delete newScores[matchIndex];
      return newScores;
    });

    setIsLoadingSkeleton(true);
    await fetchAllMatchesDataWithScoresByWeekAndBlock(
      selectedWeek,
      selectedBlock
    );
    setIsLoadingSkeleton(false);
  } catch (err: any) {
    catchError("Error saving scores:", err);
  }
};
