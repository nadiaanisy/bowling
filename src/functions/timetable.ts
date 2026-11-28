import { FormEvent } from 'react';
import { catchError } from './toasts';
import {
errorToastStyle,
successToastStyle
} from './toast-styles';
import { addMatchToSchedule } from '../utils/api/add';
import { deleteMatchFromSchedule } from '../utils/api/delete';
import type {
Lane,
MatchData
} from '../utils/interfaces';
import { toast } from 'sonner';

export const getMaxWeeksPerBlock = (
  configuredWeeks: number,
  blockCount: number,
  registeredTeamTarget: number,
): number | null => {
  const derivedWeeks =
    registeredTeamTarget > 0
      ? registeredTeamTarget + (registeredTeamTarget % 2) - 1
      : null;
  return Number.isSafeInteger(configuredWeeks) && configuredWeeks > 0
    ? Math.ceil(configuredWeeks / Math.max(1, blockCount))
    : derivedWeeks;
};

export const buildLaneOptions = (
  startingLane: number,
  totalLanes: number,
): Lane[] => {
  if (
    !Number.isInteger(startingLane) ||
    startingLane < 1 ||
    !Number.isInteger(totalLanes) ||
    totalLanes < startingLane
  )
    return [];
  return Array.from(
    { length: Math.floor((totalLanes - startingLane + 1) / 2) },
    (_, index) => {
      const firstLane = startingLane + index * 2;
      return {
        id: `${firstLane}-${firstLane + 1}`,
        lane: `Lane ${firstLane} - Lane ${firstLane + 1}`,
      };
    },
  );
};

export const getUsedScheduleResources = (
  matches: MatchData[],
  weekNumber: number,
): { teams: string[]; lanes: string[] } => {
  const matchesForWeek = matches.filter(
    (match) => match.week_number === weekNumber,
  );
  return {
    lanes: matchesForWeek.map((match) => match.lane),
    teams: matchesForWeek.flatMap((match) =>
      [match.team1?.id, match.team2?.id]
        .filter((id): id is number => typeof id === 'number')
        .map(String),
    ),
  };
};

export const getScheduledWeeks = (
  matches: Record<string, MatchData[]>,
): number[] =>
  Array.from(
    new Set(
      Object.values(matches).flatMap((blockMatches) =>
        blockMatches.map((match) => match.week_number),
      ),
    ),
  ).sort((a, b) => a - b);

export const countActiveScheduleFilters = (
  week: string,
  team: string,
  status: string,
): number =>
  Number(week !== 'all') + Number(team !== 'all') + Number(status !== 'all');

export const resetScheduleFilters = (
  setWeek: (value: string) => void,
  setTeam: (value: string) => void,
  setStatus: (value: string) => void,
) => {
  setWeek('all');
  setTeam('all');
  setStatus('all');
};

export const resetMatchForm = (
  setWeek: (value: string) => void,
  setScheduledDate: (value: string) => void,
  setScheduleType: (value: 'regular' | 'pre_bowl' | 'post_bowl') => void,
  setTeam1: (value: string) => void,
  setTeam2: (value: string) => void,
  setLane: (value: string) => void,
) => {
  setWeek('');
  setScheduledDate('');
  setScheduleType('regular');
  setTeam1('');
  setTeam2('');
  setLane('');
};

export const changeMatchWeek = (
  value: string,
  setWeek: (value: string) => void,
  setTeam1: (value: string) => void,
  setTeam2: (value: string) => void,
  setLane: (value: string) => void,
) => {
  setWeek(value);
  setTeam1('');
  setTeam2('');
  setLane('');
};

export const getSuggestedSessionDate = (
  commencementDate: string,
  blockOrderNumber: number | null,
  maxWeeksPerBlock: number | null,
  week: string,
  blockMatches: MatchData[],
): string => {
  const weekNumber = Number(week);
  if (!commencementDate || !Number.isSafeInteger(weekNumber) || weekNumber < 1)
    return '';

  const previousWeekMatches = blockMatches.filter(
    (match) => match.week_number < weekNumber && Boolean(match.scheduled_date),
  );
  const previousWeekNumber = previousWeekMatches.reduce(
    (latestWeek, match) => Math.max(latestWeek, match.week_number),
    0,
  );

  let suggestedDate: Date;
  if (previousWeekNumber > 0) {
    const previousDates = previousWeekMatches
      .filter((match) => match.week_number === previousWeekNumber)
      .map((match) => match.scheduled_date as string)
      .sort();
    const latestPreviousDate = previousDates[previousDates.length - 1];
    if (!latestPreviousDate) return '';
    suggestedDate = new Date(`${latestPreviousDate}T00:00:00Z`);
    suggestedDate.setUTCDate(
      suggestedDate.getUTCDate() + (weekNumber - previousWeekNumber) * 7,
    );
  } else {
    const blockOffset =
      blockOrderNumber && maxWeeksPerBlock
        ? (blockOrderNumber - 1) * maxWeeksPerBlock
        : 0;
    suggestedDate = new Date(`${commencementDate}T00:00:00Z`);
    suggestedDate.setUTCDate(
      suggestedDate.getUTCDate() + (blockOffset + weekNumber - 1) * 7,
    );
  }

  return suggestedDate.toISOString().slice(0, 10);
};

export const handleAddMatch = async (
  event: FormEvent,
  creatingMatch: boolean,
  setCreatingMatch: (creating: boolean) => void,
  leagueId: string | null,
  blockId: string | number | null,
  weekNumber: string,
  maxWeeksPerBlock: number | null,
  scheduledDate: string,
  scheduleType: 'regular' | 'pre_bowl' | 'post_bowl',
  team1Id: string,
  team2Id: string,
  lane: string,
  onSuccess: () => void,
) => {
  event.preventDefault();
  if (creatingMatch) return;

  if (leagueId === null || blockId === null) {
    toast.error('Please select a league and block first.', errorToastStyle);
    return;
  }

  const week = Number(weekNumber);
  if (
    !Number.isSafeInteger(week) ||
    week < 1 ||
    (maxWeeksPerBlock !== null && week > maxWeeksPerBlock)
  ) {
    toast.error(
      maxWeeksPerBlock !== null
        ? `Enter a whole week number from 1 to ${maxWeeksPerBlock}.`
        : 'Enter a valid positive whole week number.',
      errorToastStyle,
    );
    return;
  }
  if (!scheduledDate) {
    toast.error(
      'Choose the actual session date. Adjust it for holidays or events.',
      errorToastStyle,
    );
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
    const created = await addMatchToSchedule(
      leagueId,
      blockId,
      week,
      team1Id,
      team2Id,
      lane,
      scheduledDate,
      scheduleType,
    );
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
  onSuccess: () => void,
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
  onSuccess: () => void,
) => {
  if (deletingMatch || matchIds.length === 0) return;

  setDeletingMatch(true);

  try {
    const results = await Promise.all(
      matchIds.map((matchId) => deleteMatchFromSchedule(matchId)),
    );

    const deletedCount = results.filter((result) => result === true).length;

    if (deletedCount === 0) return;

    toast.success(
      `${deletedCount} match${deletedCount === 1 ? '' : 'es'} removed from schedule.`,
      successToastStyle,
    );

    onSuccess();
  } catch (err) {
    catchError('Error deleting selected matches: ', err);
  } finally {
    setDeletingMatch(false);
  }
};
