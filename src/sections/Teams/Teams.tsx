import {
  useMemo,
  useEffect,
  useState
} from 'react';
import type React from 'react';
import Grid from './Grid';
import { Cards } from './Cards';
import Header from './Header';
import { AddTeamsDialog } from './AddTeamsDialog';
import { EditTeamDialog } from './EditTeamDialog';
import ManagementCard from './ManagementCard';
import { useCustomHook } from '../../utils/hooks';
import { getTeamsWithMembersByLeague } from '../../utils/api/get';
import TeamActivityPanel from './TeamActivityPanel';
import TeamRosterSummary from './TeamRosterSummary';
import ArchivedTeamsPanel from './ArchivedTeamsPanel';
import {
  handleCreateTeam,
  handleCreateTeams,
  handleUpdateTeam,
  handleDeleteTeams,
  hasTeamChanges,
  toggleSelectAllTeams,
} from '../../functions/teams';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { AdvancedPlayerFiltersValue } from '../../utils/interfaces';
import ArchivedPlayersPanel from './ArchivedPlayersPanel';
import AdvancedPlayerFilters from './AdvancedPlayerFilters';

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
    bulkTeamDialogOpen,
    setBulkTeamDialogOpen,
    multipleTeamNames,
    setMultipleTeamNames,
    creatingTeams,
    setCreatingTeams,
    archivingTeamId,
    setArchivingTeamId,
    archivedTeamsRefreshKey,
    setArchivedTeamsRefreshKey,
    archivedPlayersRefreshKey,
    setArchivedPlayersRefreshKey,
  } = useCustomHook();

  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedPlayerFiltersValue>({
      playerName: '',
      teamId: '',
      status: '',
      playerType: '',
    });

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const playerQuery = advancedFilters.playerName.trim().toLowerCase();

    return [...teams]
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: 'base',
        }),
      )
      .map((team) => {
        const teamMatches = !query || team.name.toLowerCase().includes(query);

        const teamIdMatches =
          !advancedFilters.teamId || String(team.id) === advancedFilters.teamId;

        const members = team.members.filter((player) => {
          if (player.archived_at) return false;

          const matchesName =
            !playerQuery || player.name.toLowerCase().includes(playerQuery);

          const matchesExistingSearch =
            !query ||
            team.name.toLowerCase().includes(query) ||
            player.name.toLowerCase().includes(query);

          const matchesStatus =
            !advancedFilters.status || player.status === advancedFilters.status;

          const matchesType =
            !advancedFilters.playerType ||
            player.type === advancedFilters.playerType;

          return (
            matchesName &&
            matchesExistingSearch &&
            matchesStatus &&
            matchesType &&
            teamIdMatches
          );
        });

        const hasAdvancedFilter = Boolean(
          playerQuery ||
          advancedFilters.teamId ||
          advancedFilters.status ||
          advancedFilters.playerType,
        );

        return {
          ...team,
          members,
          shouldShow:
            teamMatches || members.length > 0 || (!hasAdvancedFilter && !query),
        };
      })
      .filter((team) => team.shouldShow)
      .map(({ shouldShow: _shouldShow, ...team }) => team);
  }, [teams, searchQuery, advancedFilters]);

  const selectedTeamRecords = teams.filter((team) =>
    selectedTeams.some((id) => String(id) === String(team.id)),
  );

  const teamsWithPlayers = filteredTeams.filter(
    (team) => team.members.length > 0,
  );

  const canExpandAll = teamsWithPlayers.some(
    (team) => !(expandedTeams[team.id] ?? false),
  );

  const canCollapseAll = teamsWithPlayers.some(
    (team) => expandedTeams[team.id] ?? false,
  );

  // Keep page-local selections and open dialogs isolated to the selected league.
  useEffect(() => {
    setTeams([]);
    setSearchQuery('');
    setSelectedTeam(null);
    setSelectedTeams([]);
    setSelectedPlayers({});
    setExpandedTeams({});
    setBulkDeleteMode({});
    setBulkTeamDeleteMode(false);
    setBulkPlayerTypeValue({});
    setBulkTransferTeamId({});
    setOpenTeamMenu(null);
    setPendingDeleteType(null);
    setDialogOpen(false);
    setBulkTeamDialogOpen(false);
    setEditingTeamId(null);
    setEditingPlayerId(null);
    setNewPlayerName('');
    setMultiplePlayerNames('');
    setMultipleTeamNames('');
    setNewTeamName('');
    setConfirmOpen(false);
  }, [
    selectedLeague,
    setTeams,
    setSearchQuery,
    setSelectedTeam,
    setSelectedTeams,
    setSelectedPlayers,
    setExpandedTeams,
    setBulkDeleteMode,
    setBulkTeamDeleteMode,
    setBulkPlayerTypeValue,
    setBulkTransferTeamId,
    setOpenTeamMenu,
    setPendingDeleteType,
    setDialogOpen,
    setBulkTeamDialogOpen,
    setEditingTeamId,
    setEditingPlayerId,
    setNewPlayerName,
    setMultiplePlayerNames,
    setMultipleTeamNames,
    setNewTeamName,
    setConfirmOpen,
  ]);

  useEffect(() => {
    let isCurrent = true;

    const loadTeams = async () => {
      setIsLoadingTeams(true);
      setTeamsLoadError(null);

      try {
        const teamList = await getTeamsWithMembersByLeague(selectedLeague);

        if (isCurrent) {
          setTeams(teamList);
        }
      } catch (err) {
        if (isCurrent) {
          setTeams([]);

          setTeamsLoadError(
            err instanceof Error ? err.message : 'Unable to load teams.',
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
    setTeamsLoadError,
  ]);

  const allVisibleTeamsSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((team) =>
      selectedTeams.some((id) => String(id) === String(team.id)),
    );

  const teamCardProps: Omit<React.ComponentProps<typeof Cards>, 'team'> = {
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
    setBulkUpdatingPlayers,
    archivingTeamId,
    setArchivingTeamId,
    onTeamArchived: () => {
      setArchivedTeamsRefreshKey((current) => current + 1);
    },
    onPlayerArchived: () => {
      setArchivedPlayersRefreshKey((current) => current + 1);
    },
  };

  return (
    <div className="min-h-screen bg-[#0b0c14] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px] space-y-5">
        <Header
          isLoadingTeams={isLoadingTeams}
          retryTeams={retryTeams}
          bulkTeamDeleteMode={bulkTeamDeleteMode}
          filteredTeamsCount={filteredTeams.length}
          selectedTeamsCount={selectedTeams.length}
          deletingTeam={deletingTeam}
          allVisibleTeamsSelected={allVisibleTeamsSelected}
          onToggleSelectAll={(checked) => {
            setSelectedTeams((current) =>
              toggleSelectAllTeams(checked, filteredTeams, current),
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
              },
            );
          }}
          onCancelBulkDelete={() => {
            setSelectedTeams([]);
            setBulkTeamDeleteMode(false);
          }}
          onStartBulkDelete={() => setBulkTeamDeleteMode(true)}
          teamsCount={teams.length}
        />

        <TeamRosterSummary teams={teams} />

        <ManagementCard
          existingTeams={teams.map((team) => ({ name: team.name }))}
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
              setNewTeamName,
            );
          }}
          onOpenBulkCreate={() => {
            setMultipleTeamNames('');
            setBulkTeamDialogOpen(true);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredTeamsCount={filteredTeams.length}
        />

        <AdvancedPlayerFilters
          teams={teams}
          value={advancedFilters}
          onChange={setAdvancedFilters}
        />

        <ArchivedTeamsPanel
          leagueId={selectedLeague}
          refreshKey={archivedTeamsRefreshKey}
          onRestored={() => {
            retryTeams();
          }}
        />

        <ArchivedPlayersPanel
          leagueId={selectedLeague}
          refreshKey={archivedPlayersRefreshKey}
          onRestored={retryTeams}
        />

        <AddTeamsDialog
          open={bulkTeamDialogOpen}
          onOpenChange={(open) => {
            if (creatingTeams) return;

            setBulkTeamDialogOpen(open);

            if (!open) {
              setMultipleTeamNames('');
            }
          }}
          teamNames={multipleTeamNames}
          setTeamNames={setMultipleTeamNames}
          creatingTeams={creatingTeams}
          existingTeams={teams}
          onSubmit={(event) => {
            event.preventDefault();

            void handleCreateTeams(
              creatingTeams,
              setCreatingTeams,
              multipleTeamNames,
              selectedLeague,
              teams,
              setTeams,
              setMultipleTeamNames,
              () => {
                setBulkTeamDialogOpen(false);
              },
            );
          }}
        />

        <TeamActivityPanel leagueId={selectedLeague} />

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
            teams.find((team) => String(team.id) === String(editingTeamId)),
            editingTeamName,
            editingTeamNotes,
          )}
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
              () => setEditingTeamId(null),
            );
          }}
        />

        <ConfirmDeleteDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            if (!open && (deletingTeam || deletingPlayer)) {
              return;
            }

            setConfirmOpen(open);

            if (!open) {
              setPendingDeleteType(null);
            }
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
    </div>
  );
}
