import {
  useMemo,
  useEffect,
  useState
} from 'react';
import type React from 'react';
import Grid from './Grid';
import { Cards } from './Cards';
import Header from './Header';
import { AdvancedPlayerFiltersValue } from '../../utils/type';
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
import ArchivedPlayersPanel from './ArchivedPlayersPanel';
import AdvancedPlayerFilters from './AdvancedPlayerFilters';
import { archiveTeams } from '../../utils/api/teamArchive';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  X
} from 'lucide-react';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [bulkArchiveConfirmOpen, setBulkArchiveConfirmOpen] = useState(false);
  const [bulkArchivingTeams, setBulkArchivingTeams] = useState(false);
  const pageSize = 12;

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

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, advancedFilters, selectedLeague]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Keep page-local selections and open dialogs isolated to the selected league.
  useEffect(() => {
    setTeams([]);
    setSearchQuery('');
    setSelectedTeam(null);
    setSelectedTeams([]);
    setSelectedPlayers({});
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
    <div className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
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
          onArchiveSelected={() => setBulkArchiveConfirmOpen(true)}
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

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_364px]">
          {/* LEFT COLUMN */}
          <main className="min-w-0 space-y-4">
            <TeamRosterSummary teams={teams} />

            <section className="rounded-xl border border-violet-900/70 bg-[#11131f] p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-white">Teams</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Search and manage team rosters.
                  </p>
                </div>

                <span className="rounded-full border border-violet-900/70 bg-[#1b1c2b] px-2.5 py-1 text-xs font-medium text-slate-300">
                  {filteredTeams.length}{' '}
                  {filteredTeams.length === 1 ? 'team' : 'teams'}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#0b0c14] px-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
                <Search className="size-4 shrink-0 text-slate-400" />
                <input
                  aria-label="Search teams or players"
                  placeholder="Search teams or players..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full min-w-0 bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear team search"
                    onClick={() => setSearchQuery('')}
                    className="rounded px-2 py-1 text-sm text-slate-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </section>

            <Grid
              teams={teams}
              filteredTeams={paginatedTeams}
              isLoadingTeams={isLoadingTeams}
              teamsLoadError={teamsLoadError}
              retryTeams={retryTeams}
              teamCardProps={teamCardProps}
              currentPage={currentPage}
              totalPages={totalPages}
              totalFilteredTeams={filteredTeams.length}
              onPageChange={setCurrentPage}
            />
          </main>

          {/* RIGHT COLUMN */}
          <aside className="min-w-0 space-y-4">
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
            />

            <AdvancedPlayerFilters
              teams={teams}
              value={advancedFilters}
              onChange={setAdvancedFilters}
            />

            <ArchivedTeamsPanel
              leagueId={selectedLeague}
              refreshKey={archivedTeamsRefreshKey}
              onRestored={retryTeams}
            />

            <ArchivedPlayersPanel
              leagueId={selectedLeague}
              refreshKey={archivedPlayersRefreshKey}
              onRestored={retryTeams}
            />

            <TeamActivityPanel
              leagueId={selectedLeague}
              refreshKey={archivedTeamsRefreshKey + archivedPlayersRefreshKey}
            />
          </aside>
        </div>

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

        <AlertDialog
          open={bulkArchiveConfirmOpen}
          onOpenChange={(open) => {
            if (bulkArchivingTeams) return;
            setBulkArchiveConfirmOpen(open);
          }}
        >
          <AlertDialogContent className="border-slate-700 bg-[#11131f] text-slate-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Archive selected teams?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Archive {selectedTeamRecords.length} selected team
                {selectedTeamRecords.length === 1 ? '' : 's'}? They will be
                hidden from the active roster, while historical scores are
                preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={bulkArchivingTeams}
                className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={
                  bulkArchivingTeams ||
                  selectedTeamRecords.length === 0 ||
                  selectedLeague === null
                }
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={(event) => {
                  event.preventDefault();
                  if (bulkArchivingTeams || selectedLeague === null) return;

                  setBulkArchivingTeams(true);
                  void archiveTeams(
                    selectedTeamRecords.map((team) => team.id),
                    selectedLeague,
                  )
                    .then(({ archivedIds, failures }) => {
                      if (archivedIds.length > 0) {
                        const archivedIdSet = new Set(archivedIds.map(String));
                        setTeams((current) =>
                          current.filter(
                            (team) => !archivedIdSet.has(String(team.id)),
                          ),
                        );
                        setArchivedTeamsRefreshKey((current) => current + 1);
                        setSelectedTeams((current) =>
                          current.filter(
                            (id) => !archivedIdSet.has(String(id)),
                          ),
                        );
                        toast.success(
                          `${archivedIds.length} team${archivedIds.length === 1 ? '' : 's'} archived successfully.`,
                        );
                      }

                      if (failures.length > 0) {
                        toast.error(
                          `${failures.length} team${failures.length === 1 ? '' : 's'} could not be archived. Please review and retry.`,
                        );
                      } else {
                        setBulkArchiveConfirmOpen(false);
                        setBulkTeamDeleteMode(false);
                        setSelectedTeams([]);
                      }
                    })
                    .catch((error) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Unable to archive selected teams.',
                      );
                    })
                    .finally(() => setBulkArchivingTeams(false));
                }}
              >
                {bulkArchivingTeams ? 'Archiving…' : 'Archive selected'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
