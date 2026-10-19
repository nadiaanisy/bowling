import type {
  Dispatch,
  ReactNode,
  SetStateAction
} from 'react';
import {
  askConfirm,
  catchError
} from './toasts';
import {
  errorToastStyle,
  successToastStyle
} from './toast-styles';
import {
  addLeague,
  setupLeagueAtomic
} from '../utils/api/add';
import { deleteLeagueWithData } from '../utils/api/delete';
import { League } from '../utils/interfaces';
import { toast } from 'sonner';

/* Handles selecting a league and updating the selected league details. */
export const handleLeagueSelect = async (
  leagueId: string | number,
  leagueName: string,
  hasBlocks: boolean,
  selectLeague: (league: {
    id: string | number;
    hasBlocks?: boolean;
  }) => Promise<boolean>,
  setSelectedLeagueId: (leagueId: string | number) => void,
  setSelectedLeagueName: (leagueName: string) => void,
): Promise<void> => {
  setSelectedLeagueId(leagueId);
  setSelectedLeagueName(leagueName);

  await selectLeague({ id: leagueId, hasBlocks });
};

/* Validates league setup inputs, saves configuration, and creates blocks. */
export const handleLeagueSetup = async (
  creatingBlocks: boolean,
  setCreatingBlocks: (creating: boolean) => void,
  leagueId: string | number | null,
  blockCount: string,
  gamesPerWeek: string,
  playersPerGame: string,
  startingLane: string,
  totalLanes: string,
  setLeagueBlockStatus: Dispatch<SetStateAction<Record<string, boolean>>>,
  setShowBlockDialog: (open: boolean) => void,
  onSuccess?: (
    updatedAt: string | null,
    gamesPerWeek: number,
    playersPerGame: number,
    startingLane: number,
    totalLanes: number,
  ) => void,
) => {
  if (creatingBlocks) return;

  setCreatingBlocks(true);
  try {
    if (leagueId === null || leagueId === undefined) {
      toast.error('Please select a league first.', errorToastStyle);
      return;
    }

    // Require whole-number input; reject empty strings and values like "2abc".
    const parseWholeNumber = (value: string): number | null => {
      const trimmed = value.trim();

      if (!/^\d+$/.test(trimmed)) return null;

      const parsed = Number(trimmed);

      return Number.isSafeInteger(parsed) ? parsed : null;
    };

    const count = parseWholeNumber(blockCount);
    const games = parseWholeNumber(gamesPerWeek);
    const players = parseWholeNumber(playersPerGame);
    const lane = parseWholeNumber(startingLane);
    const lanes = parseWholeNumber(totalLanes);

    if (count === null || count < 1 || count > 10) {
      toast.error(
        'Number of blocks must be an integer between 1 and 10.',
        errorToastStyle,
      );
      return;
    }

    if (games === null || games < 1) {
      toast.error(
        'Games per week must be a positive integer.',
        errorToastStyle,
      );
      return;
    }

    if (players === null || players < 1) {
      toast.error(
        'Players per game must be a positive integer.',
        errorToastStyle,
      );
      return;
    }

    if (lanes === null || lanes < 1) {
      toast.error('Total lanes must be a positive integer.', errorToastStyle);
      return;
    }

    if (lane === null || lane < 1) {
      toast.error('Starting lane must be a positive integer.', errorToastStyle);
      return;
    }

    if (lane > lanes) {
      toast.error('Starting lane cannot exceed total lanes.', errorToastStyle);
      return;
    }

    /* --- Save League Setup --- */
    const updatedAt = await setupLeagueAtomic(
      leagueId,
      count,
      games,
      players,
      lane,
      lanes,
    );

    if (!updatedAt) {
      toast.error(
        'Unable to save league settings. Please try again.',
        errorToastStyle,
      );
      return;
    }

    /* --- Update UI --- */
    setLeagueBlockStatus((currentStatus) => ({
      ...currentStatus,
      [String(leagueId)]: true,
    }));
    setShowBlockDialog(false);
    onSuccess?.(updatedAt, games, players, lane, lanes);

    toast.success('League setup completed successfully.', successToastStyle);
  } catch (err) {
    catchError('Error setting up league: ', err);
  } finally {
    setCreatingBlocks(false);
  }
};

/* Validates input and creates a new league for the current user. */
export const handleCreateLeague = async (
  creatingLeague: boolean,
  setCreatingLeague: (creating: boolean) => void,
  leagueName: string,
  userId: string | number | null | undefined,
  setListOfLeaguesByUser: Dispatch<SetStateAction<League[]>>,
  setNewLeagueName: (name: string) => void,
  setShowCreateLeagueDialog: (open: boolean) => void,
) => {
  if (creatingLeague) return;

  setCreatingLeague(true);
  try {
    const name = leagueName.trim();

    if (!name) {
      toast.error('Please enter a league name.', errorToastStyle);
      return;
    }

    if (userId === null || userId === undefined) {
      toast.error('Unable to identify the current user.', errorToastStyle);
      return;
    }

    const data = await addLeague(name, userId);
    if (!data) return;

    const league = data as League;
    if (!league) return;

    setListOfLeaguesByUser((currentLeagues) => [...currentLeagues, league]);
    setNewLeagueName('');
    setShowCreateLeagueDialog(false);

    toast.success(
      'League created. Please complete the league setup.',
      successToastStyle,
    );
  } catch (err) {
    catchError('Error creating league: ', err);
  } finally {
    setCreatingLeague(false);
  }
};

/* Opens the setup dialog for an existing league without blocks. */
export const handleLeagueBlockSetup = async (
  leagueId: string | number,
  leagueName: string,
  hasBlocks: boolean,
  selectLeague: (league: {
    id: string | number;
    hasBlocks?: boolean;
  }) => Promise<boolean>,
  setSelectedLeagueId: (leagueId: string | number) => void,
  setSelectedLeagueName: (leagueName: string) => void,
  setShowBlockDialog: (open: boolean) => void,
): Promise<void> => {
  setSelectedLeagueId(leagueId);
  setSelectedLeagueName(leagueName);

  try {
    const leagueHasBlocks = await selectLeague({
      id: leagueId,
      hasBlocks,
    });

    if (!leagueHasBlocks) {
      setShowBlockDialog(true);
    }
  } catch (error) {
    console.error('Failed to select league:', error);
  }
};

/* Confirms league deletion and removes its data and related UI state. */
export const handleDeleteLeague = (
  leagueId: string | number,
  leagueName: string,
  setListOfLeaguesByUser: Dispatch<SetStateAction<League[]>>,
  setLeagueBlockStatus: Dispatch<SetStateAction<Record<string, boolean>>>,
  setTeamCounts: Dispatch<SetStateAction<Record<string, number>>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
) => {
  askConfirm(
    `Delete "${leagueName}" and all of its data?`,
    async () => {
      if (leagueId === null || leagueId === undefined) {
        toast.error('Please select a league first.', errorToastStyle);
        return;
      }

      try {
        const leagueDeleted = await deleteLeagueWithData(leagueId);
        if (leagueDeleted !== true) {
          throw new Error('League deletion was not confirmed.');
        }

        toast.success(
          'League and its data deleted successfully.',
          successToastStyle,
        );
        setListOfLeaguesByUser((currentLeagues) =>
          currentLeagues.filter((league) => league.id !== leagueId),
        );
        setLeagueBlockStatus((currentStatus) => {
          const nextStatus = { ...currentStatus };
          delete nextStatus[String(leagueId)];
          return nextStatus;
        });
        setTeamCounts((currentCounts) => {
          const nextCounts = { ...currentCounts };
          delete nextCounts[String(leagueId)];
          return nextCounts;
        });
      } catch (err) {
        catchError('Error deleting league: ', err);
        throw err;
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};
