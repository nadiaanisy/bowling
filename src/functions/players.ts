import type {
Dispatch,
SetStateAction
} from 'react';
import {
BowlerCategory,
PendingPlayerAction,
PlayerRow
} from '../utils/type';
import {
addPlayerToTeam,
addPlayersToTeam
} from '../utils/api/add';
import { deletePlayerFromTeam } from '../utils/api/delete';
import {
  bulkTransferPlayersToTeam,
  touchLeagueUpdatedAt,
  touchTeamUpdatedAt,
  updatePlayerInTeam,
} from '../utils/api/update';
import type { LeagueTeamWithMembers } from '../utils/interfaces';
import { archivePlayer } from '../utils/api/teamArchive';
import type { PlayerRosterType } from '../utils/constants/players';
import { toast } from 'sonner';

export const toActivePlayerRows = (
  teams: LeagueTeamWithMembers[],
): PlayerRow[] =>
  teams.flatMap((team) =>
    team.members
      .filter((player) => !player.archived_at)
      .map((player) => ({ ...player, teamName: team.name })),
  );

export const filterPlayerRows = (
  players: PlayerRow[],
  query: string,
  teamId: string,
  rosterType: string,
  status: string,
) => {
  const search = query.trim().toLocaleLowerCase();
  return players
    .filter(
      (player) =>
        !search ||
        player.name.toLocaleLowerCase().includes(search) ||
        player.teamName.toLocaleLowerCase().includes(search),
    )
    .filter((player) => teamId === 'all' || String(player.team_id) === teamId)
    .filter(
      (player) =>
        rosterType === 'all' || (player.type ?? 'regular') === rosterType,
    )
    .filter(
      (player) => status === 'all' || (player.status ?? 'active') === status,
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
};

export const positiveSetupNumber = (
  config: Record<string, unknown>,
  key: string,
) => {
  const value = Number(config[key]);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const nonNegativeSetupNumber = (
  config: Record<string, unknown>,
  key: string,
) => {
  const value = Number(config[key]);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
};

export const resetPlayerForm = (setters: {
  setName: (value: string) => void;
  setTeamId: (value: string) => void;
  setRosterType: (value: PlayerRosterType) => void;
  setStatus: (value: string) => void;
  setNotes: (value: string) => void;
  setAverage: (value: string) => void;
  setGender: (value: string) => void;
  setBulkNames: (value: string) => void;
  setBulkMode: (value: boolean) => void;
  setEditing: (value: PlayerRow | null) => void;
}) => {
  setters.setName('');
  setters.setTeamId('');
  setters.setRosterType('regular');
  setters.setStatus('active');
  setters.setNotes('');
  setters.setAverage('');
  setters.setGender('');
  setters.setBulkNames('');
  setters.setBulkMode(false);
  setters.setEditing(null);
};

export const openAddPlayerForm = (
  teams: LeagueTeamWithMembers[],
  setters: Parameters<typeof resetPlayerForm>[0] & {
    setDialogOpen: (open: boolean) => void;
  },
) => {
  resetPlayerForm(setters);
  setters.setTeamId(teams[0] ? String(teams[0].id) : '');
  setters.setDialogOpen(true);
};

export const openBulkAddPlayerForm = (
  teams: LeagueTeamWithMembers[],
  setters: Parameters<typeof resetPlayerForm>[0] & {
    setDialogOpen: (open: boolean) => void;
  },
) => {
  resetPlayerForm(setters);
  setters.setTeamId(teams[0] ? String(teams[0].id) : '');
  setters.setBulkMode(true);
  setters.setDialogOpen(true);
};

export const openEditPlayerForm = (
  player: PlayerRow,
  setters: Parameters<typeof resetPlayerForm>[0] & {
    setDialogOpen: (open: boolean) => void;
  },
) => {
  setters.setEditing(player);
  setters.setName(player.name);
  setters.setTeamId(String(player.team_id ?? ''));
  setters.setRosterType(
    player.type === 'substitute' ? 'substitute' : 'regular',
  );
  setters.setStatus(player.status ?? 'active');
  setters.setNotes(player.notes ?? '');
  setters.setAverage(player.average == null ? '' : String(player.average));
  setters.setGender(player.gender ?? '');
  setters.setBulkMode(false);
  setters.setDialogOpen(true);
};

export async function savePlayerRecord(args: {
  saving: boolean;
  setSaving: (saving: boolean) => void;
  leagueId: string | number | null;
  config: Record<string, unknown>;
  teams: LeagueTeamWithMembers[];
  rosterMax: number | null;
  editing: PlayerRow | null;
  name: string;
  teamId: string;
  rosterType: PlayerRosterType;
  status: string;
  notes: string;
  average: string;
  gender: string;
  setDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  onSaved: () => void;
}) {
  const {
    saving,
    setSaving,
    leagueId,
    config,
    teams,
    rosterMax,
    editing,
    name,
    teamId,
    rosterType,
    status,
    notes,
    average,
    gender,
    setDialogOpen,
    resetForm,
    onSaved,
  } = args;
  if (saving) return;
  if (leagueId === null || !name.trim() || !teamId) {
    toast.error('Enter a player name and choose a team.');
    return;
  }
  if (rosterType === 'substitute' && config.allow_substitutes !== true) {
    toast.error('Substitute players are disabled in League Setup.');
    return;
  }
  let parsedAverage: number | null;
  try {
    parsedAverage = parseAverageInput(average);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Invalid average.');
    return;
  }
  const target = teams.find((team) => String(team.id) === teamId);
  if (!target) {
    toast.error('Choose a team in this league.');
    return;
  }
  if (
    editing &&
    String(editing.team_id) !== teamId &&
    target.members.some(
      (player) =>
        !player.archived_at &&
        player.name.trim().toLocaleLowerCase() ===
          name.trim().toLocaleLowerCase(),
    )
  ) {
    toast.error(
      `A player named "${name.trim()}" already exists on ${target.name}.`,
    );
    return;
  }
  const targetCount = target.members.filter(
    (player) => !player.archived_at,
  ).length;
  if (
    (!editing || String(editing.team_id) !== teamId) &&
    rosterMax !== null &&
    targetCount >= rosterMax
  ) {
    toast.error(
      `${target.name} has reached its ${rosterMax}-player roster limit.`,
    );
    return;
  }
  setSaving(true);
  try {
    if (editing) {
      const sourceTeamId = String(editing.team_id ?? '');
      const updated = await updatePlayerInTeam(
        editing.id,
        sourceTeamId,
        leagueId,
        {
          name: name.trim(),
          type: rosterType,
          status,
          notes: notes.trim(),
          average: parsedAverage,
          gender: gender || null,
        },
      );
      if (!updated) return;
      if (sourceTeamId !== teamId) {
        const moved = await bulkTransferPlayersToTeam(
          [editing.id],
          sourceTeamId,
          teamId,
          leagueId,
        );
        if (!moved.length) return;
        await touchTeamUpdatedAt(teamId, leagueId);
      }
      await touchTeamUpdatedAt(sourceTeamId, leagueId);
      toast.success('Player updated.');
    } else {
      const added = await addPlayerToTeam(name, teamId, leagueId, rosterType, {
        average: parsedAverage,
        gender: gender || null,
      });
      if (!added) return;
      await touchTeamUpdatedAt(teamId, leagueId);
      toast.success('Player added.');
    }
    await touchLeagueUpdatedAt(leagueId);
    setDialogOpen(false);
    resetForm();
    onSaved();
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Unable to save player.',
    );
  } finally {
    setSaving(false);
  }
}

export async function addPlayerRecordsInBulk(args: {
  saving: boolean;
  setSaving: (saving: boolean) => void;
  leagueId: string | number | null;
  config: Record<string, unknown>;
  teams: LeagueTeamWithMembers[];
  rosterMax: number | null;
  teamId: string;
  rosterType: PlayerRosterType;
  bulkNames: string;
  setDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  onSaved: () => void;
}) {
  const {
    saving,
    setSaving,
    leagueId,
    config,
    teams,
    rosterMax,
    teamId,
    rosterType,
    bulkNames,
    setDialogOpen,
    resetForm,
    onSaved,
  } = args;
  if (saving) return;
  if (leagueId === null || !teamId) {
    toast.error('Choose a team first.');
    return;
  }
  if (rosterType === 'substitute' && config.allow_substitutes !== true) {
    toast.error('Substitute players are disabled in League Setup.');
    return;
  }
  let playersToAdd: Array<{
    name: string;
    average: number | null;
    gender: string | null;
  }>;
  try {
    playersToAdd = parseBulkPlayerLines(bulkNames);
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Check the bulk player list.',
    );
    return;
  }
  const target = teams.find((team) => String(team.id) === teamId);
  if (!target || !playersToAdd.length) {
    toast.error('Choose a team and enter at least one name.');
    return;
  }
  const used = target.members.filter((player) => !player.archived_at).length;
  const remaining =
    rosterMax === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, rosterMax - used);
  if (playersToAdd.length > remaining) {
    toast.error(`Only ${remaining} roster slot(s) remain for ${target.name}.`);
    return;
  }
  setSaving(true);
  try {
    const added = await addPlayersToTeam(
      playersToAdd,
      teamId,
      leagueId,
      rosterType,
    );
    if (!added.length) return;
    await touchTeamUpdatedAt(teamId, leagueId);
    await touchLeagueUpdatedAt(leagueId);
    toast.success(
      `${added.length} player${added.length === 1 ? '' : 's'} added to ${target.name}.`,
    );
    setDialogOpen(false);
    resetForm();
    onSaved();
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Unable to add players.',
    );
  } finally {
    setSaving(false);
  }
}

export async function runPlayerActions(args: {
  pendingAction: PendingPlayerAction;
  leagueId: string | number | null;
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>;
  setArchivedRefreshKey: Dispatch<SetStateAction<number>>;
  setSelectedIds: Dispatch<SetStateAction<Array<string | number>>>;
  setPendingAction: (action: PendingPlayerAction) => void;
}) {
  const {
    pendingAction,
    leagueId,
    setTeams,
    setArchivedRefreshKey,
    setSelectedIds,
    setPendingAction,
  } = args;
  if (!pendingAction || leagueId === null) return;
  const action = pendingAction.action;
  const results = await Promise.all(
    pendingAction.players.map(async (player) => {
      try {
        if (action === 'archive')
          await archivePlayer(player.id, player.team_id!, leagueId);
        else if (
          !(await deletePlayerFromTeam(player.id, player.team_id!, leagueId))
        )
          throw new Error('Delete failed.');
        return String(player.id);
      } catch {
        return null;
      }
    }),
  );
  const completed = new Set(results.filter((id): id is string => id !== null));
  if (completed.size) {
    setTeams((current) =>
      current.map((team) => ({
        ...team,
        members:
          action === 'archive'
            ? team.members.map((player) =>
                completed.has(String(player.id))
                  ? { ...player, archived_at: new Date().toISOString() }
                  : player,
              )
            : team.members.filter(
                (player) => !completed.has(String(player.id)),
              ),
      })),
    );
    if (action === 'archive') setArchivedRefreshKey((value) => value + 1);
    await touchLeagueUpdatedAt(leagueId);
    toast.success(
      `${completed.size} player${completed.size === 1 ? '' : 's'} ${action === 'archive' ? 'archived' : 'deleted'}.`,
    );
  }
  if (completed.size < pendingAction.players.length)
    toast.error(
      `${pendingAction.players.length - completed.size} action(s) failed.`,
    );
  setSelectedIds([]);
  setPendingAction(null);
}

export function getBowlerCategory(
  average: number | null | undefined,
  setupConfig: Record<string, unknown>,
): BowlerCategory {
  if (
    average === null ||
    average === undefined ||
    !Number.isFinite(Number(average))
  ) {
    return 'unclassified';
  }

  const threshold = Number(setupConfig.open_average_threshold);
  if (
    setupConfig.allow_open_bowlers === true &&
    Number.isFinite(threshold) &&
    threshold > 0 &&
    Number(average) < threshold
  ) {
    return 'open';
  }

  return 'graded';
}

export function parseAverageInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(
      'Average must be a whole number greater than or equal to 0.',
    );
  }
  return parsed;
}

export function parseBulkPlayerLines(value: string): Array<{
  name: string;
  average: number | null;
  gender: string | null;
}> {
  const rows = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return rows.map((row, index) => {
    const [rawName, rawAverage = '', rawGender = ''] = row
      .split('|')
      .map((part) => part.trim());
    if (!rawName)
      throw new Error(`Line ${index + 1}: player name is required.`);
    let average: number | null;
    try {
      average = parseAverageInput(rawAverage);
    } catch {
      throw new Error(
        `Line ${index + 1}: average must be a whole number of 0 or higher.`,
      );
    }
    const gender = rawGender.toLocaleLowerCase();
    if (gender && !['male', 'female'].includes(gender)) {
      throw new Error(`Line ${index + 1}: gender must be Male or Female.`);
    }
    return { name: rawName, average, gender: gender || null };
  });
}
