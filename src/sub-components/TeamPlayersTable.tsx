import type {
  Dispatch,
  ReactNode,
  SetStateAction
} from 'react';
import {
  deleteSelectedPlayersForTeam,
  handleBulkTransferPlayers,
  handleBulkUpdatePlayerType,
  handleDeletePlayer,
  handleOpenEditPlayerDialog,
  handleUpdatePlayer,
  hasPlayerChanges,
  selectAllPlayersForTeam,
  togglePlayerSelection
} from '../utils/functions';
import type {
  LeagueMember,
  LeagueTeamWithMembers
} from '../utils/interfaces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/table';
import { Trash2 } from 'lucide-react';
import { Button } from '../components/button';
import { EditPlayerDialog } from './EditPlayerDialog';

interface TeamPlayersTableProps {
  team: LeagueTeamWithMembers;
  teams: LeagueTeamWithMembers[];
  visibleMembers: LeagueMember[];
  isBulkMode: boolean;
  selectedIds: Array<string | number>;
  hasSelection: boolean;
  selectedLeague: string | null;
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>;
  deletingPlayer: boolean;
  setDeletingPlayer: (deleting: boolean) => void;
  updatingPlayer: boolean;
  setUpdatingPlayer: (updating: boolean) => void;
  selectedPlayers: Record<string, Array<string | number>>;
  setSelectedPlayers: Dispatch<SetStateAction<Record<string, Array<string | number>>>>;
  setBulkDeleteMode: Dispatch<SetStateAction<Record<string, boolean>>>;
  setPendingDeleteType: (type: 'team' | 'teams' | 'player' | 'players' | null) => void;
  setConfirmMessage: (message: ReactNode) => void;
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>;
  setConfirmOpen: (open: boolean) => void;
  editingPlayerId: string | number | null;
  setEditingPlayerId: (id: string | number | null) => void;
  editingPlayerName: string;
  setEditingPlayerName: (name: string) => void;
  editingPlayerStatus: string;
  setEditingPlayerStatus: (status: string) => void;
  editingPlayerType: 'regular' | 'substitute';
  setEditingPlayerType: (type: 'regular' | 'substitute') => void;
  editingPlayerNotes: string;
  setEditingPlayerNotes: (notes: string) => void;
  bulkPlayerTypeValue: Record<string, 'regular' | 'substitute'>;
  setBulkPlayerTypeValue: Dispatch<SetStateAction<Record<string, 'regular' | 'substitute'>>>;
  bulkTransferTeamId: Record<string, string>;
  setBulkTransferTeamId: Dispatch<SetStateAction<Record<string, string>>>;
  bulkUpdatingPlayers: boolean;
  setBulkUpdatingPlayers: (updating: boolean) => void;
  exitBulkMode: () => void;
}

export function TeamPlayersTable({
  team,
  teams,
  visibleMembers,
  isBulkMode,
  selectedIds,
  hasSelection,
  selectedLeague,
  setTeams,
  deletingPlayer,
  setDeletingPlayer,
  updatingPlayer,
  setUpdatingPlayer,
  selectedPlayers,
  setSelectedPlayers,
  setBulkDeleteMode,
  setPendingDeleteType,
  setConfirmMessage,
  setConfirmAction,
  setConfirmOpen,
  editingPlayerId,
  setEditingPlayerId,
  editingPlayerName,
  setEditingPlayerName,
  editingPlayerStatus,
  setEditingPlayerStatus,
  editingPlayerType,
  setEditingPlayerType,
  editingPlayerNotes,
  setEditingPlayerNotes,
  bulkPlayerTypeValue,
  setBulkPlayerTypeValue,
  bulkTransferTeamId,
  setBulkTransferTeamId,
  bulkUpdatingPlayers,
  setBulkUpdatingPlayers,
  exitBulkMode
}: TeamPlayersTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {isBulkMode && (
              <TableHead className="w-8 px-1">
                <input
                  type="checkbox"
                  aria-label={`Select all players in ${team.name}`}
                  checked={
                    team.members.length > 0 &&
                    selectedIds.length === team.members.length
                  }
                  onChange={(event) => {
                    setSelectedPlayers((currentSelection) => ({
                      ...currentSelection,
                      [String(team.id)]: selectAllPlayersForTeam(team, event.target.checked)
                    }));
                  }}
                />
              </TableHead>
            )}
            <TableHead className={isBulkMode ? 'px-1' : undefined}>
              Player Name
            </TableHead>
            <TableHead className="w-[100px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleMembers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={isBulkMode ? 3 : 2}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                No players match your search.
              </TableCell>
            </TableRow>
          )}
          {visibleMembers.map((player) => (
            <TableRow key={player.id}>
              {isBulkMode && (
                <TableCell className="w-8 px-1">
                  <input
                    type="checkbox"
                    aria-label={`Select ${player.name}`}
                    checked={selectedIds.some((id) => String(id) === String(player.id))}
                    onChange={() => setSelectedPlayers(togglePlayerSelection(team.id, player.id, selectedPlayers))}
                    disabled={deletingPlayer}
                  />
                </TableCell>
              )}
              <TableCell className={isBulkMode ? 'px-1' : undefined}>
                {player.name}
              </TableCell>
              <TableCell className="text-center">
                <EditPlayerDialog
                  player={player}
                  open={editingPlayerId === player.id}
                  onOpenChange={(open) => {
                    if (!open && !updatingPlayer) setEditingPlayerId(null);
                  }}
                  onTriggerClick={() => handleOpenEditPlayerDialog(
                    player,
                    setEditingPlayerId,
                    setEditingPlayerName,
                    setEditingPlayerStatus,
                    setEditingPlayerType,
                    setEditingPlayerNotes
                  )}
                  editingPlayerName={editingPlayerName}
                  setEditingPlayerName={setEditingPlayerName}
                  editingPlayerStatus={editingPlayerStatus}
                  setEditingPlayerStatus={setEditingPlayerStatus}
                  editingPlayerType={editingPlayerType}
                  setEditingPlayerType={setEditingPlayerType}
                  editingPlayerNotes={editingPlayerNotes}
                  setEditingPlayerNotes={setEditingPlayerNotes}
                  updatingPlayer={updatingPlayer}
                  hasChanges={hasPlayerChanges(
                    player,
                    editingPlayerName,
                    editingPlayerType,
                    editingPlayerStatus,
                    editingPlayerNotes
                  )}
                  onCancel={() => setEditingPlayerId(null)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editingPlayerId === null) return;

                    void handleUpdatePlayer(
                      updatingPlayer,
                      setUpdatingPlayer,
                      editingPlayerId,
                      team.id,
                      selectedLeague,
                      editingPlayerName,
                      editingPlayerType,
                      editingPlayerStatus,
                      editingPlayerNotes,
                      player.name,
                      player.type,
                      player.status,
                      player.notes,
                      setTeams,
                      () => setEditingPlayerId(null)
                    );
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setPendingDeleteType('player');
                    handleDeletePlayer(
                      deletingPlayer,
                      setDeletingPlayer,
                      player.id,
                      player.name,
                      team.name,
                      team.id,
                      selectedLeague,
                      setTeams,
                      setConfirmMessage,
                      setConfirmAction,
                      setConfirmOpen,
                      () => {
                        setSelectedPlayers((current) => ({
                          ...current,
                          [String(team.id)]: (current[String(team.id)] ?? [])
                            .filter((id) => String(id) !== String(player.id))
                        }));
                      }
                    )
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isBulkMode && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {hasSelection && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={deletingPlayer}
              onClick={() => {
                setPendingDeleteType('players');
                deleteSelectedPlayersForTeam(
                  team,
                  selectedPlayers,
                  deletingPlayer,
                  setDeletingPlayer,
                  selectedLeague,
                  setTeams,
                  setConfirmMessage,
                  setConfirmAction,
                  setConfirmOpen,
                  setBulkDeleteMode,
                  setSelectedPlayers
                );
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete selected ({selectedIds.length})
            </Button>
          )}
          {hasSelection && (
            <>
              <Select
                value={bulkPlayerTypeValue[String(team.id)] ?? 'regular'}
                onValueChange={(value) => setBulkPlayerTypeValue((current) => ({
                  ...current,
                  [String(team.id)]: value as 'regular' | 'substitute'
                }))}
                disabled={bulkUpdatingPlayers}
              >
                <SelectTrigger className="h-9 w-[140px]" aria-label="Set selected players' type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="substitute">Substitute</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bulkUpdatingPlayers}
                onClick={() => void handleBulkUpdatePlayerType(
                  bulkUpdatingPlayers,
                  setBulkUpdatingPlayers,
                  team,
                  selectedPlayers,
                  bulkPlayerTypeValue[String(team.id)] ?? 'regular',
                  selectedLeague,
                  setTeams,
                  () => setSelectedPlayers((current) => ({ ...current, [String(team.id)]: [] }))
                )}
              >
                Set type
              </Button>
              <Select
                value={bulkTransferTeamId[String(team.id)] ?? ''}
                onValueChange={(value) => setBulkTransferTeamId((current) => ({
                  ...current,
                  [String(team.id)]: value
                }))}
                disabled={bulkUpdatingPlayers}
              >
                <SelectTrigger className="h-9 w-[160px]" aria-label="Transfer selected players to team">
                  <SelectValue placeholder="Transfer to team" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((candidate) => String(candidate.id) !== String(team.id))
                    .map((candidate) => (
                      <SelectItem key={candidate.id} value={String(candidate.id)}>
                        {candidate.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bulkUpdatingPlayers || !bulkTransferTeamId[String(team.id)]}
                onClick={() => void handleBulkTransferPlayers(
                  bulkUpdatingPlayers,
                  setBulkUpdatingPlayers,
                  team,
                  selectedPlayers,
                  bulkTransferTeamId[String(team.id)] ?? '',
                  teams,
                  selectedLeague,
                  setTeams,
                  exitBulkMode
                )}
              >
                Transfer selected
              </Button>
            </>
          )}
          <Button type="button" variant="outline" size="sm" onClick={exitBulkMode}>
            Done
          </Button>
        </div>
      )}
    </>
  );
}
