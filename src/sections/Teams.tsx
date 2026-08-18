import {
  useMemo,
  useEffect
} from 'react';
import {
  Trash2,
  UserPlus,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Pencil,
  X
} from 'lucide-react';
import {
  handleCreateTeam,
  handleCreatePlayer,
  handleCreatePlayers,
  handleUpdatePlayer,
  handleUpdateTeam,
  handleDeletePlayer,
  handleDeleteTeam,
  handleDeleteTeams,
  getSelectedPlayersForTeam,
  getVisibleMembers,
  hasPlayerChanges,
  hasTeamChanges,
  togglePlayerSelection,
  deleteSelectedPlayersForTeam
} from '../utils/functions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../components/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/alert-dialog';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { useCustomHook } from '../utils/hooks';
import { Skeleton } from '../components/skeleton';
import { Textarea } from '../components/textarea';
import { getTeamsWithMembersByLeague } from '../utils/api/get';
import type { LeagueTeamWithMembers } from '../utils/interfaces';
import { TeamActionsMenu } from '../sub-components/TeamActionsMenu';


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
                  setSelectedTeams((current) => {
                    if (event.target.checked) {
                      const merged = [...current, ...filteredTeams.map((team) => team.id)];
                      return Array.from(
                        new Map(merged.map((id) => [String(id), id])).values()
                      );
                    }

                    const visibleIds = new Set(filteredTeams.map((team) => String(team.id)));
                    return current.filter((id) => !visibleIds.has(String(id)));
                  });
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
            <Button type="submit" disabled={creatingTeam || !newTeamName.trim()}>
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

      {isLoadingTeams && (
        <div className="mx-auto grid w-full max-w-3xl gap-4">
          {[1, 2].map((item) => (
            <Card key={item}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoadingTeams && !teamsLoadError && <div className="mx-auto grid w-full max-w-3xl gap-4">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {bulkTeamDeleteMode && (
                      <input
                        type="checkbox"
                        aria-label={`Select team ${team.name}`}
                        checked={selectedTeams.some((id) => String(id) === String(team.id))}
                        onChange={() => setSelectedTeams((current) =>
                          current.some((id) => String(id) === String(team.id))
                            ? current.filter((id) => String(id) !== String(team.id))
                            : [...current, team.id]
                        )}
                      />
                    )}
                    <CardTitle>{team.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {team.members.length} players
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={dialogOpen && selectedTeam === team.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) {
                      setSelectedTeam(team.id);
                      setAddMode('single');
                    }
                    if (!open) {
                      setNewPlayerName('');
                      setMultiplePlayerNames('');
                    }
                  }}>
                  <TeamActionsMenu
                    teamName={team.name}
                    memberCount={team.members.length}
                    deletingTeam={deletingTeam}
                    deletingPlayer={deletingPlayer}
                    open={openTeamMenu === String(team.id)}
                    onToggle={() => setOpenTeamMenu((current) =>
                      current === String(team.id) ? null : String(team.id)
                    )}
                    onAddPlayer={() => {
                      setSelectedTeam(team.id);
                      setDialogOpen(true);
                      setAddMode('single');
                      setOpenTeamMenu(null);
                    }}
                    onEditTeam={() => {
                      setEditingTeamId(team.id);
                      setEditingTeamName(team.name);
                      setEditingTeamNotes(team.notes ?? '');
                      setOpenTeamMenu(null);
                    }}
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
                    <DialogContent
                      className="sm:max-w-[500px]"
                      onPointerDownOutside={(event) => event.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle>Add Player(s) to {team.name}</DialogTitle>
                        <DialogDescription>Choose to add a single player or multiple players at once</DialogDescription>
                      </DialogHeader>
                      
                      <div className="mb-4 space-y-2">
                        <Label htmlFor="player-type">Player type</Label>
                        <Select value={playerType} onValueChange={(value) => setPlayerType(value as 'regular' | 'substitute')}>
                          <SelectTrigger id="player-type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="substitute">Substitute</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Tabs value={addMode} onValueChange={(v) => setAddMode(v as 'single' | 'multiple')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="single">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Single Player
                          </TabsTrigger>
                          <TabsTrigger value="multiple">
                            <Users className="h-4 w-4 mr-2" />
                            Multiple Players
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="single">
                          <form
                            onSubmit={(event) => {
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
                          >
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="playerName">Player Name</Label>
                                <Input
                                  id="playerName"
                                  placeholder="Enter player name"
                                  value={newPlayerName}
                                  onChange={(e) => setNewPlayerName(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button type="submit" disabled={creatingPlayer || !newPlayerName.trim()}>
                                {creatingPlayer ? 'Adding...' : 'Add Player'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </TabsContent>

                        <TabsContent value="multiple">
                          <form
                            onSubmit={(event) => {
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
                          >
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="multiplePlayerNames">Player Names (one per line)</Label>
                                <Textarea
                                  id="multiplePlayerNames"
                                  placeholder="John Doe&#10;Jane Smith&#10;Mike Johnson"
                                  value={multiplePlayerNames}
                                  onChange={(e) => setMultiplePlayerNames(e.target.value)}
                                  rows={8}
                                  className="resize-none"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Enter each player name on a new line
                                </p>
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button type="submit" disabled={creatingPlayer || !multiplePlayerNames.trim()}>
                                {creatingPlayer ? 'Adding...' : 'Add Players'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            {team.members.length > 0 && (
              <Collapsible
                open={expandedTeams[team.id] ?? true}
                onOpenChange={(open) => setExpandedTeams(prev => ({ ...prev, [team.id]: open }))}
              >
                <div className="border-t border-border px-6 py-3 bg-muted/30">
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
                    <span className="text-sm">
                      {team.members.length} {team.members.length === 1 ? 'Player' : 'Players'}
                    </span>
                    {expandedTeams[team.id] ?? true ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {bulkDeleteMode[String(team.id)] && (
                            <TableHead className="w-8 px-1">
                              <input
                                type="checkbox"
                                aria-label={`Select all players in ${team.name}`}
                                checked={
                                  team.members.length > 0 &&
                                getSelectedPlayersForTeam(team.id, selectedPlayers).length === team.members.length
                                }
                                onChange={(event) => {
                                  setSelectedPlayers((currentSelection) => ({
                                    ...currentSelection,
                                    [String(team.id)]: event.target.checked
                                      ? team.members.map((member) => member.id)
                                      : []
                                  }));
                                }}
                              />
                            </TableHead>
                          )}
                          <TableHead className={bulkDeleteMode[String(team.id)] ? 'px-1' : undefined}>
                            Player Name
                          </TableHead>
                          <TableHead className="w-[100px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getVisibleMembers(team, searchQuery).map((player) => (
                          <TableRow key={player.id}>
                            {bulkDeleteMode[String(team.id)] && (
                              <TableCell className="w-8 px-1">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${player.name}`}
                                  checked={getSelectedPlayersForTeam(team.id, selectedPlayers).some(
                                    (id) => String(id) === String(player.id)
                                  )}
                                  onChange={() => setSelectedPlayers(togglePlayerSelection(team.id, player.id, selectedPlayers))}
                                  disabled={deletingPlayer}
                                />
                              </TableCell>
                            )}
                            <TableCell className={bulkDeleteMode[String(team.id)] ? 'px-1' : undefined}>
                              {player.name}
                            </TableCell>
                            <TableCell className="text-center">
                              <Dialog
                                open={editingPlayerId === player.id}
                                onOpenChange={(open) => {
                                  if (!open && !updatingPlayer) setEditingPlayerId(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Edit ${player.name}`}
                                    onClick={() => {
                                      setEditingPlayerId(player.id);
                                      setEditingPlayerName(player.name);
                                      const normalizedStatus = player.status?.trim().toLowerCase();
                                      setEditingPlayerStatus(
                                        normalizedStatus === 'inactive' || normalizedStatus === 'substitute'
                                          ? normalizedStatus
                                          : 'active'
                                      );
                                      setEditingPlayerType(player.type ?? 'regular');
                                      setEditingPlayerNotes(player.notes ?? '');
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
                                  <DialogHeader>
                                    <DialogTitle>Edit player</DialogTitle>
                                    <DialogDescription>Update this player's name, status, or notes.</DialogDescription>
                                  </DialogHeader>
                                  <form
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
                                    className="space-y-4"
                                  >
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-player-name-${player.id}`}>Name</Label>
                                      <Input
                                        id={`edit-player-name-${player.id}`}
                                        value={editingPlayerName}
                                        onChange={(event) => setEditingPlayerName(event.target.value)}
                                        disabled={updatingPlayer}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-player-status-${player.id}`}>Status</Label>
                                      <Select
                                        value={editingPlayerStatus || 'active'}
                                        onValueChange={setEditingPlayerStatus}
                                        disabled={updatingPlayer}
                                      >
                                        <SelectTrigger id={`edit-player-status-${player.id}`}>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="inactive">Inactive</SelectItem>
                                          <SelectItem value="substitute">Substitute</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-player-type-${player.id}`}>Type</Label>
                                      <Select value={editingPlayerType} onValueChange={(value) => setEditingPlayerType(value as 'regular' | 'substitute')} disabled={updatingPlayer}>
                                        <SelectTrigger id={`edit-player-type-${player.id}`}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="regular">Regular</SelectItem>
                                          <SelectItem value="substitute">Substitute</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-player-notes-${player.id}`}>Notes</Label>
                                      <Textarea
                                        id={`edit-player-notes-${player.id}`}
                                        value={editingPlayerNotes}
                                        onChange={(event) => setEditingPlayerNotes(event.target.value)}
                                        disabled={updatingPlayer}
                                        rows={4}
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingPlayerId(null)}
                                        disabled={updatingPlayer}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={
                                          updatingPlayer ||
                                          !editingPlayerName.trim() ||
                                          !hasPlayerChanges(
                                            player,
                                            editingPlayerName,
                                            editingPlayerType,
                                            editingPlayerStatus,
                                            editingPlayerNotes
                                          )
                                        }
                                      >
                                        {updatingPlayer ? 'Saving...' : 'Save changes'}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
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
                    {bulkDeleteMode[String(team.id)] && (
                      <div className="mt-4 flex gap-2">
                        {getSelectedPlayersForTeam(team.id, selectedPlayers).length > 0 && (
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
                              Delete selected ({getSelectedPlayersForTeam(team.id, selectedPlayers).length})
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBulkDeleteMode((current) => ({
                              ...current,
                              [String(team.id)]: false
                            }));
                            setSelectedPlayers((current) => ({
                              ...current,
                              [String(team.id)]: []
                            }));
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            )}
          </Card>
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

      <Dialog
        open={editingTeamId !== null}
        onOpenChange={(open) => {
          if (!open && !updatingTeam) setEditingTeamId(null);
        }}
      >
        <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit team</DialogTitle>
            <DialogDescription>Update the team name for this league.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
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
          >
            <div className="space-y-2">
              <Label htmlFor="edit-team-name">Team name</Label>
              <Input
                id="edit-team-name"
                value={editingTeamName}
                onChange={(event) => setEditingTeamName(event.target.value)}
                disabled={updatingTeam}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team-notes">Notes</Label>
              <Textarea
                id="edit-team-notes"
                value={editingTeamNotes}
                onChange={(event) => setEditingTeamNotes(event.target.value)}
                disabled={updatingTeam}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingTeamId(null)} disabled={updatingTeam}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingTeam || !editingTeamName.trim() || !hasTeamChanges(teams.find((team) => team.id === editingTeamId), editingTeamName, editingTeamNotes)}
              >
                {updatingTeam ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && (deletingTeam || deletingPlayer)) return;
          setConfirmOpen(open);
          if (!open) setPendingDeleteType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeleteType === 'team'
                ? 'Delete team?'
                : pendingDeleteType === 'teams'
                ? 'Delete selected teams?'
                : pendingDeleteType === 'players'
                ? 'Delete selected players?'
                : pendingDeleteType === 'player'
                ? 'Delete player?'
                : 'Confirm deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTeam || deletingPlayer}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingTeam || deletingPlayer}
              onClick={async (event) => {
                event.preventDefault();
                if (deletingTeam || deletingPlayer) return;

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
            >
              {deletingTeam || deletingPlayer ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
