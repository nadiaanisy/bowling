import type React from 'react';
import {
  useMemo,
  useEffect
} from 'react';
import {
  handleCreateTeam,
  handleUpdateTeam,
  handleDeleteTeams,
  hasTeamChanges,
  toggleSelectAllTeams
} from '../utils/functions';
import Grid from '../sub-components/Teams/Grid';
import { useCustomHook } from '../utils/hooks';
import Header from '../sub-components/Teams/Header';
import { Cards } from '../sub-components/Teams/Cards';
import { getTeamsWithMembersByLeague } from '../utils/api/get';
import ManagementCard from '../sub-components/Teams/ManagementCard';
import { EditTeamDialog } from '../sub-components/Teams/EditTeamDialog';
import { ConfirmDeleteDialog } from '../sub-components/Teams/ConfirmDeleteDialog';

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

    const sortedTeams = [...teams].sort(
      (firstTeam, secondTeam) =>
        firstTeam.name.localeCompare(
          secondTeam.name,
          undefined,
          { sensitivity: 'base' }
        )
    );

    if (!query) return sortedTeams;

    return sortedTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.members.some((member) =>
          member.name.toLowerCase().includes(query)
        )
    );
  }, [searchQuery, teams]);

  const selectedTeamRecords = teams.filter((team) =>
    selectedTeams.some(
      (id) => String(id) === String(team.id)
    )
  );

  const teamsWithPlayers = filteredTeams.filter(
    (team) => team.members.length > 0
  );

  const canExpandAll = teamsWithPlayers.some(
    (team) => !(expandedTeams[team.id] ?? false)
  );

  const canCollapseAll = teamsWithPlayers.some(
    (team) => expandedTeams[team.id] ?? false
  );

  useEffect(() => {
    let isCurrent = true;

    const loadTeams = async () => {
      setIsLoadingTeams(true);
      setTeamsLoadError(null);

      try {
        const teamList =
          await getTeamsWithMembersByLeague(
            selectedLeague
          );

        if (isCurrent) {
          setTeams(teamList);
        }
      } catch (err) {
        if (isCurrent) {
          setTeams([]);

          setTeamsLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to load teams.'
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingTeams(false);
        }
      }
    };

    void loadTeams();

    return () => {
      isCurrent = false;
    };
  }, [
    selectedLeague,
    teamsReloadKey,
    setTeams,
    setIsLoadingTeams,
    setTeamsLoadError
  ]);

  const allVisibleTeamsSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((team) =>
      selectedTeams.some(
        (id) => String(id) === String(team.id)
      )
    );

  const teamCardProps: Omit<
    React.ComponentProps<typeof Cards>,
    'team'
  > = {
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
  };

  return (
    <div className="space-y-6">
      <Header
        isLoadingTeams={isLoadingTeams}
        retryTeams={retryTeams}
        bulkTeamDeleteMode={bulkTeamDeleteMode}
        filteredTeamsCount={filteredTeams.length}
        selectedTeamsCount={selectedTeams.length}
        deletingTeam={deletingTeam}
        allVisibleTeamsSelected={
          allVisibleTeamsSelected
        }
        onToggleSelectAll={(checked) => {
          setSelectedTeams((current) =>
            toggleSelectAllTeams(
              checked,
              filteredTeams,
              current
            )
          );
        }}
        onDeleteSelected={() => {
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
        onCancelBulkDelete={() => {
          setSelectedTeams([]);
          setBulkTeamDeleteMode(false);
        }}
        onStartBulkDelete={() =>
          setBulkTeamDeleteMode(true)
        }
        teamsCount={teams.length}
      />

      <ManagementCard
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        creatingTeam={creatingTeam}
        onCreateTeam={() => {
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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTeamsCount={filteredTeams.length}
      />

      <Grid
        teams={teams}
        filteredTeams={filteredTeams}
        isLoadingTeams={isLoadingTeams}
        teamsLoadError={teamsLoadError}
        retryTeams={retryTeams}
        expandedTeams={expandedTeams}
        setExpandedTeams={setExpandedTeams}
        teamCardProps={teamCardProps}
        canExpandAll={canExpandAll}
        canCollapseAll={canCollapseAll}
      />

      <EditTeamDialog
        open={editingTeamId !== null}
        onOpenChange={(open) => {
          if (!open && !updatingTeam) {
            setEditingTeamId(null);
          }
        }}
        editingTeamName={editingTeamName}
        setEditingTeamName={setEditingTeamName}
        editingTeamNotes={editingTeamNotes}
        setEditingTeamNotes={setEditingTeamNotes}
        updatingTeam={updatingTeam}
        hasChanges={hasTeamChanges(
          teams.find(
            (team) => team.id === editingTeamId
          ),
          editingTeamName,
          editingTeamNotes
        )}
        onCancel={() =>
          setEditingTeamId(null)
        }
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
          if (
            !open &&
            (deletingTeam || deletingPlayer)
          ) {
            return;
          }

          setConfirmOpen(open);

          if (!open) {
            setPendingDeleteType(null);
          }
        }}
        pendingDeleteType={pendingDeleteType}
        confirmMessage={confirmMessage}
        isDeleting={
          deletingTeam || deletingPlayer
        }
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