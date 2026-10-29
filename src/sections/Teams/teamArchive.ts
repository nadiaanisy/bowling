import {
  Dispatch,
  ReactNode,
  SetStateAction
} from 'react';
import {
  addPlayersToTeam,
  addPlayerToTeam,
  addTeam,
  addTeams,
} from '../../utils/api/add';
import { askConfirm } from '../../functions/toasts';
import {
  deleteTeamsFromLeague,
  deleteTeamFromLeague,
  deletePlayerFromTeam,
  deletePlayersFromTeam,
} from '../../utils/api/delete';
import {
  bulkTransferPlayersToTeam,
  bulkUpdatePlayersType,
  touchLeagueUpdatedAt,
  touchTeamUpdatedAt,
  updatePlayerInTeam,
  updateTeamInLeague,
} from '../../utils/api/update';
import {
  LeagueMember,
  LeagueTeamWithMembers
} from '../../utils/interfaces';
import {
  errorToastStyle,
  successToastStyle,
} from '../../functions/toast-styles';
import { sortTeamsByName } from '../../functions/sortTeamsByName';
import { sortMembersByName } from '../../functions/sortMembersByName';
import { supabase } from '../../utils/supabase/supabaseClient';
import { toast } from 'sonner';

export type TeamActivity = {
  id: number;
  league_id: number;
  team_id: number | null;
  actor_auth_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

type Id = string | number;

async function writeTeamActivity(
  leagueId: Id,
  teamId: Id | null,
  action: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from('team_activity').insert({
    league_id: leagueId,
    team_id: teamId,
    action,
    details,
  });

  if (error) {
    throw new Error(
      `The change was saved, but its activity record could not be written: ${error.message}`,
    );
  }
}

async function setTeamArchivedState(
  teamId: Id,
  leagueId: Id,
  archived: boolean,
): Promise<void> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('teams')
    .update({
      archived_at: archived ? timestamp : null,
      updated_at: timestamp,
    })
    .eq('id', teamId)
    .eq('league_id', leagueId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update team archive status: ${error.message}`);
  }

  if (!data) {
    throw new Error('Team not found or you do not have access to this league.');
  }

  await writeTeamActivity(
    leagueId,
    teamId,
    archived ? 'team.archived' : 'team.restored',
  );
}

export async function archiveTeam(teamId: Id, leagueId: Id): Promise<void> {
  await setTeamArchivedState(teamId, leagueId, true);
}

export async function restoreTeam(teamId: Id, leagueId: Id): Promise<void> {
  await setTeamArchivedState(teamId, leagueId, false);
}

async function setPlayerArchivedState(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
  archived: boolean,
): Promise<void> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('players')
    .update({
      archived_at: archived ? timestamp : null,
      updated_at: timestamp,
    })
    .eq('id', playerId)
    .eq('team_id', teamId)
    .eq('league_id', leagueId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update player archive status: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      'Player not found or the player does not belong to this team and league.',
    );
  }

  await writeTeamActivity(
    leagueId,
    teamId,
    archived ? 'player.archived' : 'player.restored',
    { player_id: playerId },
  );
}

export async function archivePlayer(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
): Promise<void> {
  await setPlayerArchivedState(playerId, teamId, leagueId, true);
}

export async function restorePlayer(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
): Promise<void> {
  await setPlayerArchivedState(playerId, teamId, leagueId, false);
}

export async function getTeamActivity(
  leagueId: Id,
  limit = 50,
): Promise<TeamActivity[]> {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 200));

  const { data, error } = await supabase
    .from('team_activity')
    .select(
      'id, league_id, team_id, actor_auth_user_id, action, details, created_at',
    )
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Unable to load team activity: ${error.message}`);
  }

  return (data ?? []) as TeamActivity[];
}

/**
 * Archives multiple teams independently so one failure does not prevent the
 * remaining selected teams from being processed. Returns successful IDs and
 * failures for the caller to report.
 */
export async function archiveTeams(
  teamIds: Id[],
  leagueId: Id,
): Promise<{
    archivedIds: Id[];
    failures: Array<{ teamId: Id; error: unknown }>;
  }> {
  const results = await Promise.all(
    teamIds.map(async (teamId) => {
      try {
        await archiveTeam(teamId, leagueId);
        return { teamId, success: true as const };
      } catch (error) {
        return { teamId, success: false as const, error };
      }
    }),
  );

  return {
    archivedIds: results
      .filter((result) => result.success)
      .map((result) => result.teamId),
    failures: results
      .filter(
        (result): result is { teamId: Id; success: false; error: unknown } =>
          !result.success,
      )
      .map(({ teamId, error }) => ({ teamId, error })),
  };
}

export const setAllTeamsExpanded = (
  teams: LeagueTeamWithMembers[],
  expanded: boolean,
  setExpandedTeams: Dispatch<SetStateAction<Record<string, boolean>>>,
) => {
  setExpandedTeams(
    Object.fromEntries(teams.map((team) => [String(team.id), expanded])),
  );
};

export const toggleSelectAllTeams = (
  checked: boolean,
  filteredTeams: LeagueTeamWithMembers[],
  currentSelected: Array<string | number>,
) => {
  if (checked) {
    const merged = [
      ...currentSelected,
      ...filteredTeams.map((team) => team.id),
    ];
    return Array.from(new Map(merged.map((id) => [String(id), id])).values());
  }

  const visibleIds = new Set(filteredTeams.map((team) => String(team.id)));
  return currentSelected.filter((id) => !visibleIds.has(String(id)));
};

export const toggleTeamSelection = (
  teamId: string | number,
  selectedTeams: Array<string | number>,
) =>
  selectedTeams.some((id) => String(id) === String(teamId))
    ? selectedTeams.filter((id) => String(id) !== String(teamId))
    : [...selectedTeams, teamId];

export const getVisibleMembers = (
  team: LeagueTeamWithMembers,
  searchQuery: string,
) => {
  const query = searchQuery.trim().toLowerCase();
  const sortedMembers = [...team.members].sort((firstMember, secondMember) =>
    firstMember.name.localeCompare(secondMember.name, undefined, {
      sensitivity: 'base',
    }),
  );
  if (!query || team.name.toLowerCase().includes(query)) return sortedMembers;
  return sortedMembers.filter((member) =>
    member.name.toLowerCase().includes(query),
  );
};

export const getSelectedPlayersForTeam = (
  teamId: string | number,
  selectedPlayers: Record<string, Array<string | number>>,
) => selectedPlayers[String(teamId)] ?? [];

export const handleOpenAddPlayerDialog = (
  teamId: string | number,
  setSelectedTeam: (id: string | number | null) => void,
  setDialogOpen: (open: boolean) => void,
  setAddMode: (mode: 'single' | 'multiple') => void,
  setOpenTeamMenu: (id: string | null) => void,
) => {
  setSelectedTeam(teamId);
  setDialogOpen(true);
  setAddMode('single');
  setOpenTeamMenu(null);
};

export const handleAddPlayerDialogOpenChange = (
  open: boolean,
  teamId: string | number,
  setDialogOpen: (open: boolean) => void,
  setSelectedTeam: (id: string | number | null) => void,
  setAddMode: (mode: 'single' | 'multiple') => void,
  setNewPlayerName: (name: string) => void,
  setMultiplePlayerNames: (names: string) => void,
) => {
  setDialogOpen(open);
  if (open) {
    setSelectedTeam(teamId);
    setAddMode('single');
  } else {
    setNewPlayerName('');
    setMultiplePlayerNames('');
  }
};

export const handleOpenEditTeamDialog = (
  team: Pick<LeagueTeamWithMembers, 'id' | 'name' | 'notes'>,
  setEditingTeamId: (id: string | number | null) => void,
  setEditingTeamName: (name: string) => void,
  setEditingTeamNotes: (notes: string) => void,
  setOpenTeamMenu: (id: string | null) => void,
) => {
  setEditingTeamId(team.id);
  setEditingTeamName(team.name);
  setEditingTeamNotes(team.notes ?? '');
  setOpenTeamMenu(null);
};

export const handleCreatePlayer = async (
  creatingPlayer: boolean,
  setCreatingPlayer: (creating: boolean) => void,
  playerName: string,
  teamId: string | number,
  teamName: string,
  existingMembers: Array<{ name: string }>,
  leagueId: string | number | null,
  playerType: 'regular' | 'substitute',
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setPlayerName: (name: string) => void,
) => {
  if (creatingPlayer) return;

  const name = playerName.trim();
  if (!name) {
    toast.error('Please enter a player name.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  if (
    existingMembers.some(
      (member) => member.name.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    toast.error(
      `A player named "${name}" already exists in team "${teamName}".`,
      errorToastStyle,
    );
    return;
  }

  setCreatingPlayer(true);
  try {
    const player = await addPlayerToTeam(name, teamId, leagueId, playerType);
    if (!player) return;
    await touchTeamUpdatedAt(teamId, leagueId);
    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        String(team.id) === String(teamId)
          ? { ...team, members: sortMembersByName([...team.members, player]) }
          : team,
      ),
    );
    setPlayerName('');
    toast.success(
      `Player "${name}" added to team "${teamName}".`,
      successToastStyle,
    );
  } finally {
    setCreatingPlayer(false);
  }
};

export const handleCreatePlayers = async (
  creatingPlayer: boolean,
  setCreatingPlayer: (creating: boolean) => void,
  playerNames: string,
  teamId: string | number,
  teamName: string,
  existingMembers: Array<{ name: string }>,
  leagueId: string | number | null,
  playerType: 'regular' | 'substitute',
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setPlayerNames: (names: string) => void,
) => {
  if (creatingPlayer) return;

  const names = Array.from(
    new Set(
      playerNames
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );

  if (names.length === 0) {
    toast.error('Enter at least one player name.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  const existingNames = new Set(
    existingMembers.map((member) => member.name.trim().toLowerCase()),
  );
  const duplicateNames = names.filter((name) =>
    existingNames.has(name.toLowerCase()),
  );
  if (duplicateNames.length > 0) {
    toast.error(
      `${duplicateNames.join(', ')} already exist in team "${teamName}".`,
      errorToastStyle,
    );
    return;
  }

  setCreatingPlayer(true);
  try {
    const players = await addPlayersToTeam(names, teamId, leagueId, playerType);
    if (players.length === 0) return;
    await touchTeamUpdatedAt(teamId, leagueId);
    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        String(team.id) === String(teamId)
          ? {
            ...team,
            members: sortMembersByName([...team.members, ...players]),
          }
          : team,
      ),
    );
    setPlayerNames('');
    toast.success(
      `${players.length} player${players.length === 1 ? '' : 's'} added to team "${teamName}".`,
      successToastStyle,
    );
  } finally {
    setCreatingPlayer(false);
  }
};

export const handleCreateTeam = async (
  creatingTeam: boolean,
  setCreatingTeam: (creating: boolean) => void,
  teamName: string,
  leagueId: string | number | null,
  existingTeams: Array<{ name: string }>,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setTeamName: (name: string) => void,
) => {
  if (creatingTeam) return;

  const name = teamName.trim();
  if (!name) {
    toast.error('Please enter a team name.', errorToastStyle);
    return;
  }

  if (
    existingTeams.some(
      (team) => team.name.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    toast.error(
      'A team with this name already exists in the league.',
      errorToastStyle,
    );
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  setCreatingTeam(true);
  try {
    const team = await addTeam(name, leagueId);
    if (!team) return;
    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      sortTeamsByName([...currentTeams, { ...team, members: [] }]),
    );
    setTeamName('');
    toast.success('Team created successfully.', successToastStyle);
  } finally {
    setCreatingTeam(false);
  }
};

export const handleUpdateTeam = async (
  updatingTeam: boolean,
  setUpdatingTeam: (updating: boolean) => void,
  teamId: string | number,
  leagueId: string | number | null,
  teamName: string,
  teamNotes: string,
  existingTeams: LeagueTeamWithMembers[],
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  onSuccess: () => void,
) => {
  if (updatingTeam) return;

  const trimmedName = teamName.trim();
  if (!trimmedName) {
    toast.error('Please enter a team name.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  if (
    existingTeams.some(
      (team) =>
        String(team.id) !== String(teamId) &&
        team.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
  ) {
    toast.error(
      'A team with this name already exists in the league.',
      errorToastStyle,
    );
    return;
  }

  const originalTeam = existingTeams.find(
    (team) => String(team.id) === String(teamId),
  );
  const nameChanged = originalTeam?.name.trim() !== trimmedName;
  const notesChanged = originalTeam?.notes?.trim() !== teamNotes.trim();

  setUpdatingTeam(true);
  try {
    const updatedTeam = await updateTeamInLeague(
      teamId,
      leagueId,
      trimmedName,
      teamNotes,
    );
    if (!updatedTeam) {
      toast.error(
        'Team update failed. No changes were saved.',
        errorToastStyle,
      );
      return;
    }
    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      sortTeamsByName(
        currentTeams.map((team) =>
          String(team.id) === String(teamId)
            ? { ...team, ...updatedTeam }
            : team,
        ),
      ),
    );
    toast.success(
      nameChanged || notesChanged
        ? `Team "${originalTeam?.name ?? updatedTeam.name}" updated ${[
          nameChanged ? `name to "${updatedTeam.name}"` : null,
          notesChanged
            ? `notes to "${updatedTeam.notes?.trim() || '(empty)'}"`
            : null,
        ]
          .filter(Boolean)
          .join('; ')}.`
        : `Team "${updatedTeam.name}" saved with no field changes.`,
      successToastStyle,
    );
    onSuccess();
  } finally {
    setUpdatingTeam(false);
  }
};

export const hasTeamChanges = (
  team: LeagueTeamWithMembers | undefined,
  editingTeamName: string,
  editingTeamNotes: string,
) => {
  return Boolean(
    team &&
    editingTeamName.trim() &&
    (editingTeamName.trim() !== team.name.trim() ||
      editingTeamNotes.trim() !== (team.notes?.trim() || '')),
  );
};

export const handleDeleteTeams = (
  deletingTeam: boolean,
  setDeletingTeam: (deleting: boolean) => void,
  teams: LeagueTeamWithMembers[],
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
  onSuccess?: () => void,
) => {
  if (deletingTeam || teams.length === 0) return;

  askConfirm(
    `Delete ${teams.length} selected team${teams.length === 1 ? '' : 's'} and all of their members?`,
    async () => {
      if (leagueId === null) {
        toast.error('Please select a league first.', errorToastStyle);
        return;
      }

      setDeletingTeam(true);

      try {
        const deletedIds = await deleteTeamsFromLeague(
          teams.map((team) => team.id),
          leagueId,
        );

        if (deletedIds.length === 0) return;

        await touchLeagueUpdatedAt(leagueId);

        const deletedIdSet = new Set(deletedIds.map(String));

        setTeams((currentTeams) =>
          currentTeams.filter((team) => !deletedIdSet.has(String(team.id))),
        );

        toast.success(
          `${deletedIds.length} team${deletedIds.length === 1 ? '' : 's'} deleted successfully.`,
          successToastStyle,
        );

        onSuccess?.();
      } finally {
        setDeletingTeam(false);
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};

export const handleDeleteTeam = (
  deletingTeam: boolean,
  setDeletingTeam: (deleting: boolean) => void,
  teamId: string | number,
  teamName: string,
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
) => {
  if (deletingTeam) return;

  askConfirm(
    `Delete "${teamName}" and all of its members?`,
    async () => {
      if (leagueId === null) {
        toast.error('Please select a league first.', errorToastStyle);
        return;
      }

      setDeletingTeam(true);
      try {
        const deleted = await deleteTeamFromLeague(teamId, leagueId);
        if (deleted !== true) return;
        await touchLeagueUpdatedAt(leagueId);

        setTeams((currentTeams) =>
          currentTeams.filter((team) => String(team.id) !== String(teamId)),
        );
        toast.success('Team deleted successfully.', successToastStyle);
      } finally {
        setDeletingTeam(false);
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};

export const deleteSelectedPlayersForTeam = (
  team: LeagueTeamWithMembers,
  selectedPlayers: Record<string, Array<string | number>>,
  deletingPlayer: boolean,
  setDeletingPlayer: (deleting: boolean) => void,
  selectedLeague: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
  setBulkDeleteMode: Dispatch<SetStateAction<Record<string, boolean>>>,
  setSelectedPlayers: Dispatch<
    SetStateAction<Record<string, Array<string | number>>>
  >,
) => {
  const selectedIds = new Set(
    getSelectedPlayersForTeam(team.id, selectedPlayers).map((id) => String(id)),
  );
  const selectedMembers = team.members.filter((member) =>
    selectedIds.has(String(member.id)),
  );

  handleDeletePlayers(
    deletingPlayer,
    setDeletingPlayer,
    selectedMembers,
    team.id,
    team.name,
    selectedLeague,
    setTeams,
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
    () => {
      setBulkDeleteMode((current) => ({
        ...current,
        [String(team.id)]: false,
      }));
      setSelectedPlayers((current) => ({
        ...current,
        [String(team.id)]: [],
      }));
    },
  );
};

export const handleBulkTransferPlayers = async (
  bulkUpdatingPlayers: boolean,
  setBulkUpdatingPlayers: (updating: boolean) => void,
  team: LeagueTeamWithMembers,
  selectedPlayers: Record<string, Array<string | number>>,
  toTeamId: string,
  teams: LeagueTeamWithMembers[],
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  onSuccess: () => void,
) => {
  if (bulkUpdatingPlayers) return;

  const playerIds = getSelectedPlayersForTeam(team.id, selectedPlayers);
  if (playerIds.length === 0) return;

  const destinationTeam = teams.find(
    (candidate) => String(candidate.id) === toTeamId,
  );

  if (!destinationTeam) {
    toast.error('Please select a destination team.', errorToastStyle);
    return;
  }

  if (String(team.id) === String(destinationTeam.id)) {
    toast.error('Choose a different destination team.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  setBulkUpdatingPlayers(true);

  try {
    const movedPlayers = await bulkTransferPlayersToTeam(
      playerIds,
      team.id,
      destinationTeam.id,
      leagueId,
    );

    if (movedPlayers.length === 0) return;

    await touchTeamUpdatedAt(team.id, leagueId);
    await touchTeamUpdatedAt(destinationTeam.id, leagueId);
    await touchLeagueUpdatedAt(leagueId);

    const movedIds = new Set(movedPlayers.map((player) => String(player.id)));

    setTeams((currentTeams) =>
      currentTeams.map((currentTeam) => {
        if (String(currentTeam.id) === String(team.id)) {
          return {
            ...currentTeam,
            members: currentTeam.members.filter(
              (member) => !movedIds.has(String(member.id)),
            ),
          };
        }

        if (String(currentTeam.id) === String(destinationTeam.id)) {
          const existingIds = new Set(
            currentTeam.members.map((member) => String(member.id)),
          );

          return {
            ...currentTeam,
            members: sortMembersByName([
              ...currentTeam.members,
              ...movedPlayers.filter(
                (player) => !existingIds.has(String(player.id)),
              ),
            ]),
          };
        }

        return currentTeam;
      }),
    );

    toast.success(
      `${movedPlayers.length} player${movedPlayers.length === 1 ? '' : 's'} transferred to "${destinationTeam.name}".`,
      successToastStyle,
    );

    onSuccess();
  } finally {
    setBulkUpdatingPlayers(false);
  }
};

export const hasPlayerChanges = (
  player: LeagueTeamWithMembers['members'][number],
  editingPlayerName: string,
  editingPlayerType: 'regular' | 'substitute',
  editingPlayerStatus: string,
  editingPlayerNotes: string,
) => {
  const currentStatus = editingPlayerStatus.trim().toLowerCase() || 'active';
  const originalStatus = player.status?.trim().toLowerCase() || 'active';
  const originalType = player.type ?? 'regular';

  return (
    editingPlayerName.trim() !== player.name.trim() ||
    editingPlayerType !== originalType ||
    currentStatus !== originalStatus ||
    editingPlayerNotes.trim() !== (player.notes?.trim() || '')
  );
};

export const handleBulkUpdatePlayerType = async (
  bulkUpdatingPlayers: boolean,
  setBulkUpdatingPlayers: (updating: boolean) => void,
  team: LeagueTeamWithMembers,
  selectedPlayers: Record<string, Array<string | number>>,
  newType: 'regular' | 'substitute',
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  onSuccess: () => void,
) => {
  if (bulkUpdatingPlayers) return;

  const playerIds = getSelectedPlayersForTeam(team.id, selectedPlayers);

  if (playerIds.length === 0) return;

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  setBulkUpdatingPlayers(true);

  try {
    const updatedIds = await bulkUpdatePlayersType(
      playerIds,
      team.id,
      leagueId,
      newType,
    );

    if (updatedIds.length === 0) return;

    await touchTeamUpdatedAt(team.id, leagueId);
    await touchLeagueUpdatedAt(leagueId);

    const updatedIdSet = new Set(updatedIds.map(String));

    setTeams((currentTeams) =>
      currentTeams.map((currentTeam) =>
        String(currentTeam.id) === String(team.id)
          ? {
            ...currentTeam,
            members: currentTeam.members.map((member) =>
              updatedIdSet.has(String(member.id))
                ? { ...member, type: newType }
                : member,
            ),
          }
          : currentTeam,
      ),
    );

    toast.success(
      `${updatedIds.length} player${updatedIds.length === 1 ? '' : 's'} set to ${newType}.`,
      successToastStyle,
    );

    onSuccess();
  } finally {
    setBulkUpdatingPlayers(false);
  }
};

export const togglePlayerSelection = (
  teamId: string | number,
  playerId: string | number,
  selectedPlayers: Record<string, Array<string | number>>,
) => {
  const teamKey = String(teamId);
  const currentPlayers = selectedPlayers[teamKey] ?? [];
  const isSelected = currentPlayers.some(
    (id) => String(id) === String(playerId),
  );

  return {
    ...selectedPlayers,
    [teamKey]: isSelected
      ? currentPlayers.filter((id) => String(id) !== String(playerId))
      : [...currentPlayers, playerId],
  };
};

export const selectAllPlayersForTeam = (
  team: LeagueTeamWithMembers,
  checked: boolean,
) => (checked ? team.members.map((member) => member.id) : []);

export const handleDeletePlayer = (
  deletingPlayer: boolean,
  setDeletingPlayer: (deleting: boolean) => void,
  playerId: string | number,
  playerName: string,
  teamName: string,
  teamId: string | number,
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
  onSuccess?: () => void,
) => {
  if (deletingPlayer) return;

  askConfirm(
    `Delete player "${playerName}" from team "${teamName}"?`,
    async () => {
      if (leagueId === null) {
        toast.error('Please select a league first.', errorToastStyle);
        return;
      }

      setDeletingPlayer(true);
      try {
        const deleted = await deletePlayerFromTeam(playerId, teamId, leagueId);
        if (deleted !== true) return;
        await touchTeamUpdatedAt(teamId, leagueId);
        await touchLeagueUpdatedAt(leagueId);

        setTeams((currentTeams) =>
          currentTeams.map((team) =>
            String(team.id) === String(teamId)
              ? {
                ...team,
                members: team.members.filter(
                  (member) => String(member.id) !== String(playerId),
                ),
              }
              : team,
          ),
        );
        toast.success('Player deleted successfully.', successToastStyle);
        onSuccess?.();
      } finally {
        setDeletingPlayer(false);
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};

export const handleDeletePlayers = (
  deletingPlayer: boolean,
  setDeletingPlayer: (deleting: boolean) => void,
  players: Array<{ id: string | number; name: string }>,
  teamId: string | number,
  teamName: string,
  leagueId: string | number | null,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
  onSuccess?: () => void,
) => {
  if (deletingPlayer || players.length === 0) return;

  askConfirm(
    `Delete ${players.length} selected player${players.length === 1 ? '' : 's'} from team "${teamName}"?`,
    async () => {
      if (leagueId === null) {
        toast.error('Please select a league first.', errorToastStyle);
        return;
      }

      setDeletingPlayer(true);

      try {
        const deletedIds = await deletePlayersFromTeam(
          players.map((player) => player.id),
          teamId,
          leagueId,
        );

        if (deletedIds.length === 0) return;

        await touchTeamUpdatedAt(teamId, leagueId);
        await touchLeagueUpdatedAt(leagueId);

        const deletedIdSet = new Set(deletedIds.map(String));

        setTeams((currentTeams) =>
          currentTeams.map((team) =>
            String(team.id) === String(teamId)
              ? {
                ...team,
                members: team.members.filter(
                  (member) => !deletedIdSet.has(String(member.id)),
                ),
              }
              : team,
          ),
        );

        toast.success(
          `${deletedIds.length} player${deletedIds.length === 1 ? '' : 's'} deleted from team "${teamName}".`,
          successToastStyle,
        );

        onSuccess?.();
      } finally {
        setDeletingPlayer(false);
      }
    },
    setConfirmMessage,
    setConfirmAction,
    setConfirmOpen,
  );
};

export const handleOpenEditPlayerDialog = (
  player: LeagueMember,
  setEditingPlayerId: (id: string | number | null) => void,
  setEditingPlayerName: (name: string) => void,
  setEditingPlayerStatus: (status: string) => void,
  setEditingPlayerType: (type: 'regular' | 'substitute') => void,
  setEditingPlayerNotes: (notes: string) => void,
) => {
  setEditingPlayerId(player.id);
  setEditingPlayerName(player.name);
  const normalizedStatus = player.status?.trim().toLowerCase();
  setEditingPlayerStatus(
    normalizedStatus === 'inactive' ? normalizedStatus : 'active',
  );
  setEditingPlayerType(player.type ?? 'regular');
  setEditingPlayerNotes(player.notes ?? '');
};

export const handleUpdatePlayer = async (
  updatingPlayer: boolean,
  setUpdatingPlayer: (updating: boolean) => void,
  playerId: string | number,
  teamId: string | number,
  leagueId: string | number | null,
  name: string,
  playerType: 'regular' | 'substitute',
  status: string,
  notes: string,
  previousName: string,
  previousType: 'regular' | 'substitute' | undefined,
  previousStatus: string | undefined,
  previousNotes: string | null | undefined,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  onSuccess: () => void,
) => {
  if (updatingPlayer) return;

  if (!name.trim()) {
    toast.error('Please enter a player name.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  setUpdatingPlayer(true);
  try {
    const normalizedStatus = status.trim().toLowerCase() || 'active';
    const updateMessages: string[] = [];
    const trimmedName = name.trim();
    const trimmedNotes = notes.trim();

    if (trimmedName !== previousName.trim()) {
      updateMessages.push(
        `Player ${previousName.trim()} name changed to ${trimmedName}`,
      );
    }
    if (playerType !== (previousType ?? 'regular')) {
      updateMessages.push(
        `Player ${previousName.trim()} type changed to ${playerType}`,
      );
    }
    if (
      normalizedStatus !== (previousStatus?.trim().toLowerCase() || 'active')
    ) {
      updateMessages.push(
        `Player ${previousName.trim()} status changed to ${normalizedStatus}`,
      );
    }
    if (trimmedNotes !== (previousNotes?.trim() || '')) {
      updateMessages.push(
        trimmedNotes
          ? `Player ${previousName.trim()} notes changed to ${trimmedNotes}`
          : `Player ${previousName.trim()} notes updated`,
      );
    }

    const player = await updatePlayerInTeam(playerId, teamId, leagueId, {
      name: trimmedName,
      type: playerType,
      status: normalizedStatus,
      notes: trimmedNotes,
    });
    if (!player) {
      toast.error(
        'Player update failed. No changes were saved.',
        errorToastStyle,
      );
      return;
    }
    await touchTeamUpdatedAt(teamId, leagueId);
    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        String(team.id) === String(teamId)
          ? {
            ...team,
            members: sortMembersByName(
              team.members.map((member) =>
                String(member.id) === String(playerId)
                  ? { ...player, status: normalizedStatus }
                  : member,
              ),
            ),
          }
          : team,
      ),
    );
    toast.success(
      updateMessages.length > 0
        ? `${updateMessages.join('; ')}.`
        : `Player "${player.name}" saved with no field changes.`,
      successToastStyle,
    );
    onSuccess();
  } finally {
    setUpdatingPlayer(false);
  }
};

export const handleCreateTeams = async (
  creatingTeams: boolean,
  setCreatingTeams: (creating: boolean) => void,
  teamNames: string,
  leagueId: string | number | null,
  existingTeams: Array<{ name: string }>,
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>,
  setTeamNames: (names: string) => void,
  onSuccess?: () => void,
) => {
  if (creatingTeams) return;

  const names = Array.from(
    new Set(
      teamNames
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );

  if (names.length === 0) {
    toast.error('Enter at least one team name.', errorToastStyle);
    return;
  }

  if (leagueId === null) {
    toast.error('Please select a league first.', errorToastStyle);
    return;
  }

  const existingNames = new Set(
    existingTeams.map((team) => team.name.trim().toLowerCase()),
  );

  const duplicateNames = names.filter((name) =>
    existingNames.has(name.toLowerCase()),
  );

  if (duplicateNames.length > 0) {
    toast.error(
      `${duplicateNames.join(', ')} already exist in this league.`,
      errorToastStyle,
    );
    return;
  }

  setCreatingTeams(true);

  try {
    const createdTeams = await addTeams(names, leagueId);

    if (createdTeams.length === 0) return;

    await touchLeagueUpdatedAt(leagueId);

    setTeams((currentTeams) =>
      sortTeamsByName([
        ...currentTeams,
        ...createdTeams.map((team) => ({
          ...team,
          members: [],
        })),
      ]),
    );

    setTeamNames('');

    toast.success(
      `${createdTeams.length} team${
        createdTeams.length === 1 ? '' : 's'
      } created successfully.`,
      successToastStyle,
    );

    onSuccess?.();
  } finally {
    setCreatingTeams(false);
  }
};
