import {
  errorToastStyle,
  successToastStyle
} from './toast-styles';
import { toast } from 'sonner';
import { FormEvent } from 'react';
import { catchError } from './toasts';
import { addMatchToSchedule } from '../api/add';
import { deleteMatchFromSchedule } from '../api/delete';

export const handleAddMatch = async (
  event: FormEvent,
  creatingMatch: boolean,
  setCreatingMatch: (creating: boolean) => void,
  leagueId: string | null,
  blockId: string | number | null,
  weekNumber: string,
  team1Id: string,
  team2Id: string,
  lane: string,
  onSuccess: () => void
) => {
  event.preventDefault();
  if (creatingMatch) return;

  if (leagueId === null || blockId === null) {
    toast.error('Please select a league and block first.', errorToastStyle);
    return;
  }

  const week = parseInt(weekNumber, 10);
  if (!week || week < 1 || week > 31) {
    toast.error('Please enter a valid week number (1-31).', errorToastStyle);
    return;
  }

  if (!team1Id || !team2Id) {
    toast.error('Please select both teams.', errorToastStyle);
    return;
  }

  if (team1Id === team2Id) {
    toast.error('Team 1 and Team 2 must be different.', errorToastStyle);
    return;
  }

  if (!lane) {
    toast.error('Please select a lane.', errorToastStyle);
    return;
  }

  setCreatingMatch(true);
  try {
    const created = await addMatchToSchedule(leagueId, blockId, week, team1Id, team2Id, lane);
    if (!created) return;

    toast.success('Match scheduled successfully.', successToastStyle);
    onSuccess();
  } finally {
    setCreatingMatch(false);
  }
};

export const handleDeleteMatch = async (
  deletingMatch: boolean,
  setDeletingMatch: (deleting: boolean) => void,
  matchId: string | number,
  onSuccess: () => void
) => {
  if (deletingMatch) return;

  setDeletingMatch(true);
  try {
    const deleted = await deleteMatchFromSchedule(matchId);
    if (deleted !== true) return;

    toast.success('Match removed from schedule.', successToastStyle);
    onSuccess();
  } finally {
    setDeletingMatch(false);
  }
};

export const handleBulkDeleteMatches = async (
  deletingMatch: boolean,
  setDeletingMatch: (deleting: boolean) => void,
  matchIds: Array<string | number>,
  onSuccess: () => void
) => {
  if (deletingMatch || matchIds.length === 0) return;

  setDeletingMatch(true);

  try {
    const results = await Promise.all(
      matchIds.map((matchId) => deleteMatchFromSchedule(matchId))
    );

    const deletedCount = results.filter((result) => result === true).length;

    if (deletedCount === 0) return;

    toast.success(
      `${deletedCount} match${deletedCount === 1 ? "" : "es"} removed from schedule.`,
      successToastStyle
    );

    onSuccess();
  } catch (err) {
    catchError("Error deleting selected matches: ", err);
  } finally {
    setDeletingMatch(false);
  }
};