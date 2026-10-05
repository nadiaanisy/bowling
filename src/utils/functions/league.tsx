import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { askConfirm, catchError } from './toasts';
import { addBlockForLeague, addLeague } from '../api/add';
import { errorToastStyle, successToastStyle } from './toast-styles';
import { toast } from 'sonner';
import { League } from '../interfaces';
import { updateLeagueSetup } from '../api/update';
import { deleteLeagueWithData } from '../api/delete';

/* --- Handle Selection of League --- */
export const handleLeagueSelect = (
  leagueId: string | number,
  leagueName: string,
  hasBlocks: boolean,
  selectLeague: (league: {
    id: string | number;
    hasBlocks?: boolean;
  }) => Promise<boolean>,
  setSelectedLeagueId: (leagueId: string | number) => void,
  setSelectedLeagueName: (leagueName: string) => void,
) => {
  setSelectedLeagueId(leagueId);
  setSelectedLeagueName(leagueName);
  void selectLeague({ id: leagueId, hasBlocks });
};

/* --- League Setup --- */
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

    const count = Number.parseInt(blockCount, 10);
    const games = Number.parseInt(gamesPerWeek, 10);
    const players = Number.parseInt(playersPerGame, 10);
    const lane = Number.parseInt(startingLane, 10);
    const lanes = Number.parseInt(totalLanes, 10);

    /* --- Validation --- */
    if (!Number.isInteger(count) || count < 1 || count > 10) {
      toast.error(
        'Number of blocks must be between 1 and 10.',
        errorToastStyle,
      );
      return;
    }

    if (!Number.isInteger(games) || games < 1) {
      toast.error('Games per week must be at least 1.', errorToastStyle);
      return;
    }

    if (!Number.isInteger(players) || players < 1) {
      toast.error('Players per game must be at least 1.', errorToastStyle);
      return;
    }

    if (!Number.isInteger(lanes) || lanes < 1) {
      toast.error('Total lanes must be at least 1.', errorToastStyle);
      return;
    }

    if (!Number.isInteger(lane) || lane < 1) {
      toast.error('Starting lane must be at least 1.', errorToastStyle);
      return;
    }

    /* --- Save League Setup --- */
    const updatedAt = await updateLeagueSetup(
      leagueId,
      games,
      players,
      lane,
      lanes,
    );

    if (!updatedAt) return;

    /* --- Create Blocks --- */

    const blocksCreated = await addBlockForLeague(leagueId, count);

    if (blocksCreated !== true) {
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

/* --- Create League --- */
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

/* --- Open Existing League Setup --- */
export const handleLeagueBlockSetup = (
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
) => {
  setSelectedLeagueId(leagueId);
  setSelectedLeagueName(leagueName);
  void selectLeague({ id: leagueId, hasBlocks });

  if (!hasBlocks) setShowBlockDialog(true);
};

/* --- Delete League --- */
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
        if (leagueDeleted !== true) return;

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
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};
