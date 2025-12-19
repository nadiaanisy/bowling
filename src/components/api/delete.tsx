import { catchError, errorToastStyle, successToastStyle } from "../functions";
import { toast } from "sonner";
import { table } from "../constant";
import { deleteHelper } from "./supabaseHelper";
import { getTeamsAndPlayersByLeagueId } from "./get";

/* --- DELETE TEAM --- */
export const deleteTeam = async (
  teamId: string,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any
) => {
  try {
    const { error } = await deleteHelper(table.teams).eq("id", teamId);

    if (error) {
      toast.error("Error deleting team: " + error.message, errorToastStyle);
      return;
    }

    toast.success("Team deleted successfully!", successToastStyle);

    const updatedTeams = await getTeamsAndPlayersByLeagueId(selectedLeagueId);
    setTeams(updatedTeams);
  } catch (err) {
    catchError("Error deleting team: ", err);
  }
};

/* --- DELETE PLAYER --- */
export const deletePlayer = async (
  playerId: string,
  setTeams: (teams: any[]) => void,
  selectedLeagueId: any
) => {
  try {
    const { error } = await deleteHelper(table.players).eq("id", playerId);

    if (error) {
      toast.error("Error deleting player: " + error.message, errorToastStyle);
      return;
    }

    toast.success("Player deleted successfully!", successToastStyle);

    const updatedTeams = await getTeamsAndPlayersByLeagueId(selectedLeagueId);
    setTeams(updatedTeams);
  } catch (err) {
    catchError("Error deleting player: ", err);
  }
};

/* --- DELETE MATCH --- */
export const deleteMatch = async (
  matchId: number,
  refreshMatches: () => Promise<void>
) => {
  if (!matchId) {
    toast.error("Invalid match selected", errorToastStyle);
    return;
  }

  try {
    const { error } = await deleteHelper(table.timetable).eq("id", matchId);

    if (error) {
      toast.error("Error deleting match: " + error.message, errorToastStyle);
      return;
    }

    toast.success("Match deleted successfully!", successToastStyle);
    await refreshMatches();
  } catch (err) {
    catchError("Error deleting match:", err);
  }
};
