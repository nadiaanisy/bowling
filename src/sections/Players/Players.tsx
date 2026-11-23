import {
PlayerRuleRow as Rule,
PlayerStatCard as Stat
} from './PlayerCards';
import { usePlayersSection } from '../../utils/hooks';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/tabs';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { getBowlerCategory } from '../../functions/players';
import { Textarea } from '../../components/textarea';
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
import {
  PLAYER_CARD_CLASS as cardClass,
  PLAYER_INPUT_CLASS as inputClass,
  PlayerRosterType,
} from '../../utils/constants/players';
import {
  PLAYER_ROSTER_TYPE_OPTIONS,
  PLAYER_SETUP_RULE_KEYS,
  PLAYER_STATUS_OPTIONS,
} from '../../utils/constants/players';
import ArchivedPlayersPanel from '../Teams/ArchivedPlayersPanel';
import {
  Archive,
  CircleUserRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
  UserRoundCheck,
  UserRoundPlus,
  X,
  UserPlus,
  Users,
} from 'lucide-react';

export default function Players() {
  const {
    selectedLeague,
    config,
    teams,
    loading,
    loadError,
    query,
    setQuery,
    teamFilter,
    setTeamFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedIds,
    setSelectedIds,
    dialogOpen,
    setDialogOpen,
    editing,
    name,
    setName,
    teamId,
    setTeamId,
    rosterType,
    setRosterType,
    status,
    setStatus,
    notes,
    setNotes,
    average,
    setAverage,
    gender,
    setGender,
    bulkNames,
    setBulkNames,
    bulkMode,
    setBulkMode,
    saving,
    pendingAction,
    setPendingAction,
    archivedRefreshKey,
    reload,
    players,
    filteredPlayers,
    activeCount,
    gradedCount,
    openCount,
    rosterMax,
    gradedMin,
    openMax,
    openPerWeek,
    threshold,
    minimumPlayers,
    resetForm,
    openAdd,
    openEdit,
    savePlayer,
    saveBulk,
    executePendingAction,
  } = usePlayersSection();
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 text-slate-100">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Players Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage player records and league roster eligibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            disabled={loading}
            className="gap-2 border-white/10 bg-white/[0.03] text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedIds.length}
            onClick={() =>
              setPendingAction({
                action: 'archive',
                players: filteredPlayers.filter((p) =>
                  selectedIds.some((id) => String(id) === String(p.id)),
                ),
              })
            }
            className="gap-2 border-amber-500/30 text-amber-200"
          >
            <Archive className="h-4 w-4" />
            Bulk Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedIds.length}
            onClick={() =>
              setPendingAction({
                action: 'delete',
                players: filteredPlayers.filter((p) =>
                  selectedIds.some((id) => String(id) === String(p.id)),
                ),
              })
            }
            className="gap-2 border-rose-500/30 text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            Bulk Delete
          </Button>
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Total Players"
          value={players.length}
          icon={<UsersRound />}
        />
        <Stat
          label="Active Players"
          value={activeCount}
          icon={<UserRoundCheck />}
          tone="green"
        />
        <Stat
          label="Graded Bowlers"
          value={gradedCount}
          icon={<CircleUserRound />}
          tone="blue"
        />
        <Stat label="Open Bowlers" value={openCount} icon={<UserRoundPlus />} />
      </div>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.85fr)]">
        <section className={`${cardClass} min-w-0 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Players</h2>
              <p className="mt-1 text-sm text-slate-400">
                Search, filter and maintain this league’s player records.
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="gap-2 bg-violet-600 text-white hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </div>
          <div className="space-y-3 px-4 pb-4 sm:px-5">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b0912] px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players by name or team…"
                aria-label="Search players"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-500"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
              <select
                aria-label="Filter by team"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by roster type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All roster types</option>
                {PLAYER_ROSTER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All statuses</option>
                {PLAYER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto px-3 pb-3 sm:px-5">
            <table className="w-full min-w-[690px] text-left text-sm">
              <thead>
                <tr className="bg-violet-400/10 text-xs uppercase tracking-wide text-slate-300">
                  <th className="rounded-l-lg px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all visible players"
                      checked={
                        filteredPlayers.length > 0 &&
                        filteredPlayers.every((p) =>
                          selectedIds.some((id) => String(id) === String(p.id)),
                        )
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? filteredPlayers.map((player) => player.id)
                            : [],
                        )
                      }
                    />
                  </th>
                  <th className="px-3 py-3">Player</th>
                  <th className="px-3 py-3">Team</th>
                  <th className="px-3 py-3">Bowler data</th>
                  <th className="px-3 py-3">Player Type</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="rounded-r-lg px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      Loading players…
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-rose-300">
                      {loadError}
                    </td>
                  </tr>
                ) : !filteredPlayers.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      {players.length
                        ? 'No players match these filters.'
                        : 'No players yet. Add a player to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.name}`}
                          checked={selectedIds.some(
                            (id) => String(id) === String(p.id),
                          )}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.some((id) => String(id) === String(p.id))
                                ? current.filter(
                                    (id) => String(id) !== String(p.id),
                                  )
                                : [...current, p.id],
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs text-slate-500">ID: {p.id}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{p.teamName}</td>
                      <td className="px-3 py-3">
                        {p.average == null ? (
                          <span className="text-slate-500">
                            Awaiting game average
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-medium text-white">
                              {p.average}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs capitalize ${getBowlerCategory(p.average, config) === 'open' ? 'bg-blue-500/15 text-blue-200' : 'bg-violet-500/15 text-violet-200'}`}
                            >
                              {getBowlerCategory(p.average, config)}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs capitalize text-violet-200">
                          {p.type ?? 'regular'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs capitalize ${p.status === 'inactive' ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}
                        >
                          {p.status ?? 'active'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => openEdit(p)}
                            className="text-slate-300 hover:bg-violet-500/15 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Archive ${p.name}`}
                            onClick={() =>
                              setPendingAction({
                                action: 'archive',
                                players: [p],
                              })
                            }
                            className="text-amber-300"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${p.name}`}
                            onClick={() =>
                              setPendingAction({
                                action: 'delete',
                                players: [p],
                              })
                            }
                            className="text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p className="px-1 pt-3 text-xs text-slate-500">
              Showing {filteredPlayers.length} of {players.length} players.
              Bowler category is derived from player average and this league’s
              open average threshold.
            </p>
          </div>
        </section>
        <aside className="min-w-0 space-y-4">
          <section className={`${cardClass} p-4`}>
            <h2 className="font-semibold text-white">
              League rules (from League Setup)
            </h2>
            <p className="mb-2 mt-1 text-xs text-slate-400">
              Roster settings are read from this league’s setup.
            </p>
            <Rule
              label="Maximum roster size"
              value={rosterMax !== null ? `${rosterMax} players` : 'Not set'}
            />
            <Rule
              label="Minimum graded bowlers"
              value={gradedMin !== null ? `${gradedMin} players` : 'Not set'}
            />
            <Rule
              label="Maximum open bowlers"
              value={openMax !== null ? `${openMax} per team` : 'Not set'}
            />
            <Rule
              label="Open bowlers allowed per week"
              value={
                openPerWeek !== null ? `${openPerWeek} per week` : 'Not set'
              }
            />
            <Rule
              label="Open bowlers allowed"
              value={
                config[PLAYER_SETUP_RULE_KEYS.allowOpenBowlers] === true
                  ? 'Yes'
                  : 'No'
              }
              positive={
                config[PLAYER_SETUP_RULE_KEYS.allowOpenBowlers] === true
              }
            />
            <Rule
              label="Open bowler threshold"
              value={threshold !== null ? `${threshold} average` : 'Not set'}
            />
            <Rule
              label="Minimum players to start"
              value={
                minimumPlayers !== null
                  ? `${minimumPlayers} players`
                  : 'Not set'
              }
            />
            {config[PLAYER_SETUP_RULE_KEYS.allowSubstitutes] !== true && (
              <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-100">
                Substitute players are disabled. The form prevents adding them.
              </p>
            )}
            <p className="mt-3 rounded-lg border border-violet-300/10 bg-violet-500/[0.06] p-3 text-xs text-slate-400">
              Player Type means Regular or Substitute. Graded/Open is derived
              from average and the league threshold.
            </p>
          </section>
          <section className={`${cardClass} p-4`}>
            <h2 className="font-semibold text-white">Roster readiness</h2>
            <p className="mb-3 mt-1 text-xs text-slate-400">
              Roster counts compared with league limits. Players without a
              recorded average remain unclassified until game results are
              available.
            </p>
            {teams.length ? (
              <div className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-2">
                {teams.map((team) => {
                  const count = team.members.filter(
                    (p) => !p.archived_at,
                  ).length;
                  const members = team.members.filter((p) => !p.archived_at);
                  const gradedCount = members.filter(
                    (p) => getBowlerCategory(p.average, config) === 'graded',
                  ).length;
                  const openCount = members.filter(
                    (p) => getBowlerCategory(p.average, config) === 'open',
                  ).length;
                  const unclassifiedCount = members.filter(
                    (p) =>
                      getBowlerCategory(p.average, config) === 'unclassified',
                  ).length;
                  const full = rosterMax !== null && count >= rosterMax;
                  const tooManyOpen = openMax !== null && openCount > openMax;
                  const hasMinimumPlayers =
                    minimumPlayers === null || count >= minimumPlayers;
                  const hasMinimumGraded =
                    gradedMin === null || gradedCount >= gradedMin;
                  const ready =
                    hasMinimumPlayers &&
                    hasMinimumGraded &&
                    !tooManyOpen &&
                    unclassifiedCount === 0;
                  return (
                    <div
                      key={team.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {team.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {count}
                          {rosterMax !== null ? ` / ${rosterMax}` : ''} players
                          · {gradedCount} graded · {openCount} open ·{' '}
                          {unclassifiedCount} awaiting average
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${full || !ready ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}
                      >
                        {full
                          ? 'Limit reached'
                          : tooManyOpen
                            ? 'Too many open'
                            : unclassifiedCount > 0
                              ? 'Averages pending'
                              : !hasMinimumGraded
                                ? 'Needs graded bowlers'
                                : ready
                                  ? 'Ready'
                                  : 'Needs players'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg bg-white/[0.03] p-3 text-sm text-slate-400">
                Create teams before assigning players.
              </p>
            )}
          </section>
          <ArchivedPlayersPanel
            leagueId={selectedLeague}
            refreshKey={archivedRefreshKey}
            onRestored={reload}
          />
        </aside>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setDialogOpen(open);
            if (!open) resetForm();
          }
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 max-h-[90vh] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-violet-300/20 bg-[#15121c] text-slate-100">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? 'Edit player'
                : bulkMode
                  ? 'Bulk add players'
                  : 'Add player'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Assign player records to a team and choose roster type.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={bulkMode ? saveBulk : savePlayer}
            className="space-y-4"
          >
            <Tabs
              value={bulkMode ? 'bulk' : 'single'}
              onValueChange={(value) => setBulkMode(value === 'bulk')}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Single Player
                </TabsTrigger>
                <TabsTrigger value="bulk">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Add
                </TabsTrigger>
              </TabsList>
              {!teams.length && (
                <p
                  role="status"
                  className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100"
                >
                  Create a team in Teams before adding players to this league.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="player-team">Team</Label>
                <select
                  id="player-team"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Choose a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={String(team.id)}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-type">Player Type</Label>
                <select
                  id="player-type"
                  value={rosterType}
                  onChange={(e) =>
                    setRosterType(e.target.value as PlayerRosterType)
                  }
                  className={inputClass}
                >
                  <option value="regular">Regular</option>
                  <option
                    value="substitute"
                    disabled={
                      config[PLAYER_SETUP_RULE_KEYS.allowSubstitutes] !== true
                    }
                  >
                    Substitute
                    {config[PLAYER_SETUP_RULE_KEYS.allowSubstitutes] !== true
                      ? ' (disabled in setup)'
                      : ''}
                  </option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="player-average">Bowling average</Label>
                  <Input
                    id="player-average"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={average}
                    onChange={(event) => setAverage(event.target.value)}
                    placeholder="e.g. 185"
                    className="border-white/10 bg-[#0b0912]"
                  />
                  <p className="text-xs text-slate-500">
                    Optional. The average can be filled from game results when
                    available.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player-gender">Gender</Label>
                  <select
                    id="player-gender"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Not set</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <TabsContent value="bulk" className="mt-0">
                <div className="space-y-2">
                  <Label htmlFor="bulk-player-names">Player list</Label>
                  <Textarea
                    id="bulk-player-names"
                    rows={6}
                    value={bulkNames}
                    onChange={(e) => setBulkNames(e.target.value)}
                    placeholder={
                      'John Doe | 185 | Female\nJane Smith | 210 | Male'
                    }
                    className="max-h-[200px] resize-none overflow-y-auto"
                  />
                  <p className="text-sm text-muted-foreground">
                    One player per line: Name | Average | Gender. Average and
                    gender are optional until known.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="single" className="mt-0">
                <div className="space-y-2">
                  <Label htmlFor="player-name">Player name</Label>
                  <Input
                    id="player-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-white/10 bg-[#0b0912]"
                    required={!bulkMode}
                  />
                </div>
              </TabsContent>
              {editing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="player-status">Status</Label>
                    <select
                      id="player-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player-notes">Notes</Label>
                    <Textarea
                      id="player-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-white/10 bg-[#0b0912]"
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    !teamId ||
                    (!bulkMode && !name.trim()) ||
                    (bulkMode && !bulkNames.trim())
                  }
                  className="bg-violet-600 text-white hover:bg-violet-500"
                >
                  {saving
                    ? 'Saving…'
                    : editing
                      ? 'Save changes'
                      : bulkMode
                        ? 'Add players'
                        : 'Add player'}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="border-violet-300/20 bg-[#15121c] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === 'archive'
                ? 'Archive players?'
                : 'Delete players?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {pendingAction?.action === 'archive'
                ? 'Archived players leave the active roster and can be restored; historical records are preserved.'
                : 'This permanently removes the selected player records and may affect linked history.'}{' '}
              {pendingAction?.players.length ?? 0} player(s) selected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void executePendingAction();
              }}
              className={
                pendingAction?.action === 'archive'
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-rose-700 hover:bg-rose-600'
              }
            >
              {pendingAction?.action === 'archive' ? 'Archive' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
