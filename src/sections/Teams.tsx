import {
  useMemo,
  useEffect
} from 'react';
import {
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import {
  handleCreateTeam,
  handleUpdateTeam,
  handleDeleteTeams,
  hasTeamChanges,
  setAllTeamsExpanded,
  toggleSelectAllTeams
} from '../utils/functions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/card';
import { Input } from '../components/input';
import { Button } from '../components/button';
import { useCustomHook } from '../utils/hooks';
import { Skeleton } from '../components/skeleton';
import { TeamCard } from '../sub-components/TeamCard';
import { getTeamsWithMembersByLeague } from '../utils/api/get';
import { EditTeamDialog } from '../sub-components/EditTeamDialog';
import { ConfirmDeleteDialog } from '../sub-components/ConfirmDeleteDialog';

export default function Teams() {
  const {
    selectedLeague,
    newTeamName,
    setNewTeamName,
    creatingTeam,
    setCreatingTeam,
    searchQuery,
    setSearchQuery,
    teams,
    setTeams,
    isLoadingTeams,
    setIsLoadingTeams,
    teamsLoadError,
    setTeamsLoadError,
    teamsReloadKey,
    retryTeams,
    selectedTeam,
    setSelectedTeam,
    newPlayerName,
    setNewPlayerName,
    multiplePlayerNames,
    setMultiplePlayerNames,
    dialogOpen,
    setDialogOpen,
    addMode,
    setAddMode,
    expandedTeams,
    setExpandedTeams,
    selectedPlayers,
    setSelectedPlayers,
    bulkDeleteMode,
    setBulkDeleteMode,
    bulkPlayerTypeValue,
    setBulkPlayerTypeValue,
    bulkTransferTeamId,
    setBulkTransferTeamId,
    bulkUpdatingPlayers,
    setBulkUpdatingPlayers,
    openTeamMenu,
    setOpenTeamMenu,
    pendingDeleteType,
    setPendingDeleteType,
    deletingTeam,
    setDeletingTeam,
    updatingTeam,
    setUpdatingTeam,
    editingTeamId,
    setEditingTeamId,
    editingTeamName,
    setEditingTeamName,
    editingTeamNotes,
    setEditingTeamNotes,
    selectedTeams,
    setSelectedTeams,
    bulkTeamDeleteMode,
    setBulkTeamDeleteMode,
    deletingPlayer,
    setDeletingPlayer,
    creatingPlayer,
    setCreatingPlayer,
    playerType,
    setPlayerType,
    updatingPlayer,
    setUpdatingPlayer,
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
    confirmOpen,
    confirmMessage,
    confirmAction,
    setConfirmOpen,
    setConfirmMessage,
    setConfirmAction,
  } = useCustomHook();

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sortedTeams = [...teams].sort((firstTeam, secondTeam) =>
      firstTeam.name.localeCompare(secondTeam.name, undefined, { sensitivity: 'base' })
    );
    if (!query) return sortedTeams;

    return sortedTeams.filter((team) =>
      team.name.toLowerCase().includes(query) ||
      team.members.some((member) => member.name.toLowerCase().includes(query))
    );
  }, [searchQuery, teams]);

  const selectedTeamRecords = teams.filter((team) =>
    selectedTeams.some((id) => String(id) === String(team.id))
  );

  const teamsWithPlayers = filteredTeams.filter((team) => team.members.length > 0);
  const canExpandAll = teamsWithPlayers.some((team) => !(expandedTeams[team.id] ?? false));
  const canCollapseAll = teamsWithPlayers.some((team) => expandedTeams[team.id] ?? false);

  useEffect(() => {
    let isCurrent = true;

    const loadTeams = async () => {
      setIsLoadingTeams(true);
      setTeamsLoadError(null);

      try {
        const teamList = await getTeamsWithMembersByLeague(selectedLeague);
        if (isCurrent) setTeams(teamList);
      } catch (err) {
        if (isCurrent) {
          setTeams([]);
          setTeamsLoadError(
            err instanceof Error ? err.message : 'Unable to load teams.'
          );
        }
      } finally {
        if (isCurrent) setIsLoadingTeams(false);
      }
    };

    void loadTeams();

    return () => {
      isCurrent = false;
    };
  }, [selectedLeague, teamsReloadKey, setTeams, setIsLoadingTeams, setTeamsLoadError]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Teams Management</h1>
          <p className="text-muted-foreground">Manage teams and their players</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retryTeams}
            disabled={isLoadingTeams}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingTeams ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {bulkTeamDeleteMode ? (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label="Select all visible teams"
                checked={
                  filteredTeams.length > 0 &&
                  filteredTeams.every((team) => selectedTeams.some(
                    (id) => String(id) === String(team.id)
                  ))
                }
                onChange={(event) => {
                  setSelectedTeams((current) => toggleSelectAllTeams(event.target.checked, filteredTeams, current));
                }}
              />
              Select all
            </label>
            <span className="text-sm font-medium">{selectedTeams.length} selected</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selectedTeams.length === 0 || deletingTeam}
              onClick={() => {
                setPendingDeleteType('teams');
                handleDeleteTeams(
                  deletingTeam,
                  setDeletingTeam,
                  selectedTeamRecords,
                  selectedLeague,
                  setTeams,
                  setConfirmMessage,
                  setConfirmAction,
                  setConfirmOpen,
                  () => {
                    setSelectedTeams([]);
                    setBulkTeamDeleteMode(false);
                  }
                );
              }}
            >
              Delete selected
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => {
              setSelectedTeams([]);
              setBulkTeamDeleteMode(false);
            }}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBulkTeamDeleteMode(true)}
            disabled={teams.length === 0}
          >
            Bulk Delete Teams
          </Button>
        )}
        </div>
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Team management</CardTitle>
          <CardDescription>Add a team or find an existing team and player.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateTeam(
                creatingTeam,
                setCreatingTeam,
                newTeamName,
                selectedLeague,
                teams,
                setTeams,
                setNewTeamName
              );
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(event) => setNewTeamName(event.target.value)}
              disabled={creatingTeam}
            />
            <Button type="submit" disabled={creatingTeam || !newTeamName.trim()} className="gap-2">
              {creatingTeam && <Loader2 className="h-4 w-4 animate-spin" />}
              {creatingTeam ? 'Adding...' : 'Add Team'}
            </Button>
          </form>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or players..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear team search"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
          </p>
        </CardContent>
      </Card>

      {teamsLoadError && (
        <Card className="mx-auto w-full max-w-3xl border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-destructive" role="alert">{teamsLoadError}</p>
            <Button variant="outline" onClick={retryTeams} disabled={isLoadingTeams}>
              {isLoadingTeams ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoadingTeams && !teamsLoadError && teams.length > 0 && (
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!canExpandAll}
            onClick={() => setAllTeamsExpanded(filteredTeams, true, setExpandedTeams)}
          >
            <Maximize2 className="h-4 w-4" />
            Expand all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!canCollapseAll}
            onClick={() => setAllTeamsExpanded(filteredTeams, false, setExpandedTeams)}
          >
            <Minimize2 className="h-4 w-4" />
            Collapse all
          </Button>
        </div>
      )}

      {isLoadingTeams && (
        <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /></CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!isLoadingTeams && !teamsLoadError && <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-4">
        {filteredTeams.map((team) => (
          <div key={team.id} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]">
          <TeamCard
            team={team}
            teams={teams}
            searchQuery={searchQuery}
            selectedLeague={selectedLeague}
            bulkTeamDeleteMode={bulkTeamDeleteMode}
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
            setTeams={setTeams}
            deletingTeam={deletingTeam}
            setDeletingTeam={setDeletingTeam}
            deletingPlayer={deletingPlayer}
            setDeletingPlayer={setDeletingPlayer}
            updatingPlayer={updatingPlayer}
            setUpdatingPlayer={setUpdatingPlayer}
            openTeamMenu={openTeamMenu}
            setOpenTeamMenu={setOpenTeamMenu}
            setPendingDeleteType={setPendingDeleteType}
            setConfirmMessage={setConfirmMessage}
            setConfirmAction={setConfirmAction}
            setConfirmOpen={setConfirmOpen}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            addMode={addMode}
            setAddMode={setAddMode}
            playerType={playerType}
            setPlayerType={setPlayerType}
            newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName}
            multiplePlayerNames={multiplePlayerNames}
            setMultiplePlayerNames={setMultiplePlayerNames}
            creatingPlayer={creatingPlayer}
            setCreatingPlayer={setCreatingPlayer}
            setEditingTeamId={setEditingTeamId}
            setEditingTeamName={setEditingTeamName}
            setEditingTeamNotes={setEditingTeamNotes}
            expandedTeams={expandedTeams}
            setExpandedTeams={setExpandedTeams}
            bulkDeleteMode={bulkDeleteMode}
            setBulkDeleteMode={setBulkDeleteMode}
            selectedPlayers={selectedPlayers}
            setSelectedPlayers={setSelectedPlayers}
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
          />
          </div>
        ))}
      </div>}

      {!isLoadingTeams && !teamsLoadError && teams.length === 0 && (
        <Card className="mx-auto w-full max-w-3xl">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No teams yet. Add your first team above.</p>
          </CardContent>
        </Card>
      )}

      {!isLoadingTeams && !teamsLoadError && teams.length > 0 && filteredTeams.length === 0 && (
        <Card className="mx-auto w-full max-w-3xl">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No teams match your search query.</p>
          </CardContent>
        </Card>
      )}

      <EditTeamDialog
        open={editingTeamId !== null}
        onOpenChange={(open) => {
          if (!open && !updatingTeam) setEditingTeamId(null);
        }}
        editingTeamName={editingTeamName}
        setEditingTeamName={setEditingTeamName}
        editingTeamNotes={editingTeamNotes}
        setEditingTeamNotes={setEditingTeamNotes}
        updatingTeam={updatingTeam}
        hasChanges={hasTeamChanges(teams.find((team) => team.id === editingTeamId), editingTeamName, editingTeamNotes)}
        onCancel={() => setEditingTeamId(null)}
        onSubmit={(event) => {
          event.preventDefault();
          if (editingTeamId === null) return;

          void handleUpdateTeam(
            updatingTeam,
            setUpdatingTeam,
            editingTeamId,
            selectedLeague,
            editingTeamName,
            editingTeamNotes,
            teams,
            setTeams,
            () => setEditingTeamId(null)
          );
        }}
      />

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && (deletingTeam || deletingPlayer)) return;
          setConfirmOpen(open);
          if (!open) setPendingDeleteType(null);
        }}
        pendingDeleteType={pendingDeleteType}
        confirmMessage={confirmMessage}
        isDeleting={deletingTeam || deletingPlayer}
        onConfirm={async () => {
          setDeletingTeam(true);
          try {
            await confirmAction();
          } finally {
            setDeletingTeam(false);
            setDeletingPlayer(false);
            setConfirmOpen(false);
            setPendingDeleteType(null);
          }
        }}
      />
    </div>
  );
}
