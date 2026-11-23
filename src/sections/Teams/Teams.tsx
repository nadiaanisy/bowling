import type React from 'react';
import Grid from './Grid';
import { Cards } from './Cards';
import Header from './Header';
import { AddTeamsDialog } from './AddTeamsDialog';
import { EditTeamDialog } from './EditTeamDialog';
import ManagementCard from './ManagementCard';
import {
UseHook,
useTeamsSection
} from '../../utils/hooks';
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
  countRegisteredTeams,
  getConfiguredTeamLimit,
  getTeamSetupRuleValue,
  countNewTeamNames,
} from '../../functions/teams';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import ArchivedPlayersPanel from './ArchivedPlayersPanel';
import { archiveTeams } from '../../utils/api/teamArchive';
import { TEAM_SETUP_RULE_KEYS } from '../../utils/constants/teams';
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
X,
UsersRound
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
    listOfLeaguesByUser,
  } = UseHook();

  const selectedLeagueRecord = listOfLeaguesByUser.find(
    (league) => String(league.id) === String(selectedLeague),
  );
  const maxTeams = getConfiguredTeamLimit(
    selectedLeagueRecord?.number_of_teams,
  );
  const registeredTeamsCount = countRegisteredTeams(teams);
  const setupConfig = (selectedLeagueRecord?.setup_config ?? {}) as Record<
    string,
    unknown
  >;

  const {
    currentPage,
    setCurrentPage,
    bulkArchiveConfirmOpen,
    setBulkArchiveConfirmOpen,
    bulkArchivingTeams,
    setBulkArchivingTeams,
    filteredTeams,
    totalPages,
    paginatedTeams,
    selectedTeamRecords,
    allVisibleTeamsSelected,
  } = useTeamsSection();
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
    allowSubstitutes:
      setupConfig[TEAM_SETUP_RULE_KEYS.allowSubstitutes] === true,
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
            <section className="rounded-2xl border border-violet-500/50 bg-gradient-to-r from-violet-950/40 to-[#15111f] p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
                  <UsersRound className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-violet-100">
                    Teams registered
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {registeredTeamsCount}
                    {maxTeams !== null ? ` of ${maxTeams} teams` : ' teams'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Blind is added automatically for scheduling when the actual
                    team count is odd; it does not use a registered team slot.
                  </p>
                </div>
                {maxTeams !== null && (
                  <div className="h-3 min-w-[180px] flex-1 overflow-hidden rounded-full bg-violet-950/80">
                    <div
                      role="progressbar"
                      aria-label="Registered teams progress"
                      aria-valuemin={0}
                      aria-valuemax={maxTeams}
                      aria-valuenow={Math.min(registeredTeamsCount, maxTeams)}
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400 transition-all"
                      style={{
                        width: `${Math.min(100, (registeredTeamsCount / maxTeams) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </section>
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
                if (maxTeams !== null && registeredTeamsCount >= maxTeams) {
                  toast.error(
                    `This league allows up to ${maxTeams} registered teams.`,
                  );
                  return;
                }
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
                if (maxTeams !== null && registeredTeamsCount >= maxTeams) {
                  toast.error(
                    `This league allows up to ${maxTeams} registered teams.`,
                  );
                  return;
                }
                setMultipleTeamNames('');
                setBulkTeamDialogOpen(true);
              }}
              registeredTeamsCount={registeredTeamsCount}
              maxTeams={maxTeams}
            />

            <section className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-[#17131f] to-[#100d17] p-4">
              <h2 className="font-semibold text-white">Player roster rules</h2>
              <p className="mb-2 mt-1 text-xs text-slate-400">
                Values are read from League Setup and applied when players are
                added.
              </p>
              <SetupRule
                label="Maximum roster size"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.maxRosterSize,
                )}
                suffix=" players"
              />
              <SetupRule
                label="Minimum graded bowlers"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.gradedBowlersMin,
                )}
                suffix=" players"
              />
              <SetupRule
                label="Maximum open bowlers per team"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.openBowlersMax,
                )}
                suffix=" players"
              />
              <SetupRule
                label="Open bowlers per week"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.openBowlersPerWeek,
                )}
                suffix=" players"
              />
              <SetupRule
                label="Open bowlers allowed"
                value={
                  setupConfig[TEAM_SETUP_RULE_KEYS.openBowlersAllowed] === true
                    ? 'Yes'
                    : 'No'
                }
                positive={
                  setupConfig[TEAM_SETUP_RULE_KEYS.openBowlersAllowed] === true
                }
              />
              <SetupRule
                label="Open average threshold"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.openAverageThreshold,
                )}
                suffix=" average"
              />
              <SetupRule
                label="Minimum players to start"
                value={getTeamSetupRuleValue(
                  setupConfig,
                  TEAM_SETUP_RULE_KEYS.minimumPlayersStart,
                )}
                suffix=" players"
              />
            </section>

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
          registeredTeamsCount={registeredTeamsCount}
          maxTeams={maxTeams}
          onSubmit={(event) => {
            event.preventDefault();

            const requestedTeams = countNewTeamNames(multipleTeamNames, teams);
            const remainingSlots =
              maxTeams === null
                ? Number.POSITIVE_INFINITY
                : Math.max(0, maxTeams - registeredTeamsCount);
            if (requestedTeams > remainingSlots) {
              toast.error(
                `Only ${remainingSlots} registered team slot(s) remain.`,
              );
              return;
            }

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

function SetupRule({
  label,
  value,
  suffix = '',
  positive = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  positive?: boolean;
}) {
  const displayValue = value === 'Not set' ? value : `${value}${suffix}`;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] py-2 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${positive ? 'bg-emerald-500/15 text-emerald-200' : 'bg-violet-400/10 text-violet-100'}`}
      >
        {displayValue}
      </span>
    </div>
  );
}
