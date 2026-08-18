import type {
  Dispatch,
  ReactNode,
  SetStateAction
} from 'react';
import {
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getSelectedPlayersForTeam,
  getVisibleMembers,
  handleAddPlayerDialogOpenChange,
  handleCreatePlayer,
  handleCreatePlayers,
  handleDeleteTeam,
  handleOpenAddPlayerDialog,
  handleOpenEditTeamDialog,
  toggleTeamSelection
} from '../utils/functions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../components/collapsible';
import { AddPlayerDialog } from './AddPlayerDialog';
import { TeamActionsMenu } from './TeamActionsMenu';
import { TeamPlayersTable } from './TeamPlayersTable';
import type { LeagueTeamWithMembers } from '../utils/interfaces';

export interface TeamCardProps {
  team: LeagueTeamWithMembers;
  teams: LeagueTeamWithMembers[];
  searchQuery: string;
  selectedLeague: string | null;
  bulkTeamDeleteMode: boolean;
  selectedTeams: Array<string | number>;
  setSelectedTeams: Dispatch<SetStateAction<Array<string | number>>>;
  setTeams: Dispatch<SetStateAction<LeagueTeamWithMembers[]>>;
  deletingTeam: boolean;
  setDeletingTeam: (deleting: boolean) => void;
  deletingPlayer: boolean;
  setDeletingPlayer: (deleting: boolean) => void;
  updatingPlayer: boolean;
  setUpdatingPlayer: (updating: boolean) => void;
  openTeamMenu: string | null;
  setOpenTeamMenu: Dispatch<SetStateAction<string | null>>;
  setPendingDeleteType: (type: 'team' | 'teams' | 'player' | 'players' | null) => void;
  setConfirmMessage: (message: ReactNode) => void;
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>;
  setConfirmOpen: (open: boolean) => void;
  selectedTeam: string | number | null;
  setSelectedTeam: (id: string | number | null) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  addMode: 'single' | 'multiple';
  setAddMode: (mode: 'single' | 'multiple') => void;
  playerType: 'regular' | 'substitute';
  setPlayerType: (type: 'regular' | 'substitute') => void;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  multiplePlayerNames: string;
  setMultiplePlayerNames: (names: string) => void;
  creatingPlayer: boolean;
  setCreatingPlayer: (creating: boolean) => void;
  setEditingTeamId: (id: string | number | null) => void;
  setEditingTeamName: (name: string) => void;
  setEditingTeamNotes: (notes: string) => void;
  expandedTeams: Record<string, boolean>;
  setExpandedTeams: Dispatch<SetStateAction<Record<string, boolean>>>;
  bulkDeleteMode: Record<string, boolean>;
  setBulkDeleteMode: Dispatch<SetStateAction<Record<string, boolean>>>;
  selectedPlayers: Record<string, Array<string | number>>;
  setSelectedPlayers: Dispatch<SetStateAction<Record<string, Array<string | number>>>>;
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
}

export function TeamCard({
  team,
  teams,
  searchQuery,
  selectedLeague,
  bulkTeamDeleteMode,
  selectedTeams,
  setSelectedTeams,
  setTeams,
  deletingTeam,
  setDeletingTeam,
  deletingPlayer,
  setDeletingPlayer,
  updatingPlayer,
  setUpdatingPlayer,
  openTeamMenu,
  setOpenTeamMenu,
  setPendingDeleteType,
  setConfirmMessage,
  setConfirmAction,
  setConfirmOpen,
  selectedTeam,
  setSelectedTeam,
  dialogOpen,
  setDialogOpen,
  addMode,
  setAddMode,
  playerType,
  setPlayerType,
  newPlayerName,
  setNewPlayerName,
  multiplePlayerNames,
  setMultiplePlayerNames,
  creatingPlayer,
  setCreatingPlayer,
  setEditingTeamId,
  setEditingTeamName,
  setEditingTeamNotes,
  expandedTeams,
  setExpandedTeams,
  bulkDeleteMode,
  setBulkDeleteMode,
  selectedPlayers,
  setSelectedPlayers,
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
  setBulkUpdatingPlayers
}: TeamCardProps) {
  const visibleMembers = getVisibleMembers(team, searchQuery);
  const isBulkMode = bulkDeleteMode[String(team.id)];
  const selectedIds = getSelectedPlayersForTeam(team.id, selectedPlayers);
  const hasSelection = selectedIds.length > 0;

  const exitBulkMode = () => {
    setBulkDeleteMode((current) => ({ ...current, [String(team.id)]: false }));
    setSelectedPlayers((current) => ({ ...current, [String(team.id)]: [] }));
    setBulkTransferTeamId((current) => ({ ...current, [String(team.id)]: '' }));
  };

  const headerLabel = searchQuery.trim() && !team.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ? `${visibleMembers.length} of ${team.members.length} ${team.members.length === 1 ? 'player' : 'players'} match`
    : `${team.members.length} ${team.members.length === 1 ? 'Player' : 'Players'}`;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {bulkTeamDeleteMode && (
                <input
                  type="checkbox"
                  aria-label={`Select team ${team.name}`}
                  checked={selectedTeams.some((id) => String(id) === String(team.id))}
                  onChange={() => setSelectedTeams((current) => toggleTeamSelection(team.id, current))}
                />
              )}
              <CardTitle>{team.name}</CardTitle>
            </div>
            <CardDescription>
              {team.members.length} players
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <TeamActionsMenu
              teamName={team.name}
              memberCount={team.members.length}
              deletingTeam={deletingTeam}
              deletingPlayer={deletingPlayer}
              open={openTeamMenu === String(team.id)}
              onToggle={() => setOpenTeamMenu((current) =>
                current === String(team.id) ? null : String(team.id)
              )}
              onAddPlayer={() => handleOpenAddPlayerDialog(
                team.id,
                setSelectedTeam,
                setDialogOpen,
                setAddMode,
                setOpenTeamMenu
              )}
              onEditTeam={() => handleOpenEditTeamDialog(
                team,
                setEditingTeamId,
                setEditingTeamName,
                setEditingTeamNotes,
                setOpenTeamMenu
              )}
              onBulkDelete={() => {
                setBulkDeleteMode((current) => ({
                  ...current,
                  [String(team.id)]: true
                }));
                setOpenTeamMenu(null);
              }}
              onDeleteTeam={() => {
                setOpenTeamMenu(null);
                setPendingDeleteType('team');
                handleDeleteTeam(
                  deletingTeam,
                  setDeletingTeam,
                  team.id,
                  team.name,
                  selectedLeague,
                  setTeams,
                  setConfirmMessage,
                  setConfirmAction,
                  setConfirmOpen
                );
              }}
            />
            <AddPlayerDialog
              teamName={team.name}
              open={dialogOpen && selectedTeam === team.id}
              onOpenChange={(open) => handleAddPlayerDialogOpenChange(
                open,
                team.id,
                setDialogOpen,
                setSelectedTeam,
                setAddMode,
                setNewPlayerName,
                setMultiplePlayerNames
              )}
              playerType={playerType}
              setPlayerType={setPlayerType}
              addMode={addMode}
              setAddMode={setAddMode}
              newPlayerName={newPlayerName}
              setNewPlayerName={setNewPlayerName}
              multiplePlayerNames={multiplePlayerNames}
              setMultiplePlayerNames={setMultiplePlayerNames}
              creatingPlayer={creatingPlayer}
              onSubmitSingle={(event) => {
                event.preventDefault();
                if (selectedTeam === null) return;

                void handleCreatePlayer(
                  creatingPlayer,
                  setCreatingPlayer,
                  newPlayerName,
                  selectedTeam,
                  team.name,
                  team.members,
                  selectedLeague,
                  playerType,
                  setTeams,
                  (name) => {
                    setNewPlayerName(name);
                    if (!name) setDialogOpen(false);
                  }
                );
              }}
              onSubmitMultiple={(event) => {
                event.preventDefault();
                if (selectedTeam === null) return;

                void handleCreatePlayers(
                  creatingPlayer,
                  setCreatingPlayer,
                  multiplePlayerNames,
                  selectedTeam,
                  team.name,
                  team.members,
                  selectedLeague,
                  playerType,
                  setTeams,
                  (names) => {
                    setMultiplePlayerNames(names);
                    if (!names) setDialogOpen(false);
                  }
                );
              }}
            />
          </div>
        </div>
      </CardHeader>
      {team.members.length > 0 && (
        <Collapsible
          open={expandedTeams[team.id] ?? false}
          onOpenChange={(open) => setExpandedTeams(prev => ({ ...prev, [team.id]: open }))}
        >
          <div className="border-t border-border px-6 py-3 bg-muted/30">
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
              <span className="text-sm">{headerLabel}</span>
              {expandedTeams[team.id] ?? false ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <TeamPlayersTable
                team={team}
                teams={teams}
                visibleMembers={visibleMembers}
                isBulkMode={isBulkMode}
                selectedIds={selectedIds}
                hasSelection={hasSelection}
                selectedLeague={selectedLeague}
                setTeams={setTeams}
                deletingPlayer={deletingPlayer}
                setDeletingPlayer={setDeletingPlayer}
                updatingPlayer={updatingPlayer}
                setUpdatingPlayer={setUpdatingPlayer}
                selectedPlayers={selectedPlayers}
                setSelectedPlayers={setSelectedPlayers}
                setBulkDeleteMode={setBulkDeleteMode}
                setPendingDeleteType={setPendingDeleteType}
                setConfirmMessage={setConfirmMessage}
                setConfirmAction={setConfirmAction}
                setConfirmOpen={setConfirmOpen}
                editingPlayerId={editingPlayerId}
                setEditingPlayerId={setEditingPlayerId}
                editingPlayerName={editingPlayerName}
                setEditingPlayerName={setEditingPlayerName}
                editingPlayerStatus={editingPlayerStatus}
                setEditingPlayerStatus={setEditingPlayerStatus}
                editingPlayerType={editingPlayerType}
                setEditingPlayerType={setEditingPlayerType}
                editingPlayerNotes={editingPlayerNotes}
                setEditingPlayerNotes={setEditingPlayerNotes}
                bulkPlayerTypeValue={bulkPlayerTypeValue}
                setBulkPlayerTypeValue={setBulkPlayerTypeValue}
                bulkTransferTeamId={bulkTransferTeamId}
                setBulkTransferTeamId={setBulkTransferTeamId}
                bulkUpdatingPlayers={bulkUpdatingPlayers}
                setBulkUpdatingPlayers={setBulkUpdatingPlayers}
                exitBulkMode={exitBulkMode}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}
