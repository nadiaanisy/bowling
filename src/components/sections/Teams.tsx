import {
  getTeamsAndPlayers,
  addTeam,
  addPlayer,
  deleteTeam,
  deletePlayer,
  updatePlayer
} from '../api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Trash2,
  UserPlus,
  Users,
  ChevronDown,
  ChevronUp,
  Edit,
  Search
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { useCustomHook } from '../misc';
import { askConfirm } from '../functions';
import { useEffect, useMemo, useState } from 'react';

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Teams() {
  const {
    selectedLeague,
    newTeamName,
    isAddingTeam,
    teams,
    isLoadingSkeleton,
    dialogOpen,
    confirmOpen,
    confirmMessage,
    selectedTeam,
    selectedTeamName,
    addMode,
    newPlayerName,
    multiplePlayerNames,
    expandedTeams,
    editingPlayer,
    editedName,
    editedStatus,
    searchQuery,
    setNewTeamName,
    setIsAddingTeam,
    setTeams,
    setIsLoadingSkeleton,
    setDialogOpen,
    setConfirmOpen,
    setConfirmMessage,
    confirmAction,
    setConfirmAction,
    setSelectedTeam,
    setSelectedTeamName,
    setAddMode,
    setNewPlayerName,
    setMultiplePlayerNames,
    setExpandedTeams,
    setEditingPlayer,
    setEditedName,
    setEditedStatus,
    setSearchQuery
  } = useCustomHook();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      setIsLoadingSkeleton(true);
      const data = await getTeamsAndPlayers(selectedLeague);
      setTeams(data);
      setIsLoadingSkeleton(false);
    };

    loadTeams();
  }, []);

  useEffect(() => {
    if (addMode === 'single') {
      setMultiplePlayerNames('');
    } else if (addMode === 'multiple') {
      setNewPlayerName('');
    }
  }, [addMode]);

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return teams;
    }

    const query = searchQuery.toLowerCase();
    return teams.filter((team) => {
      // Search by team name
      if (team.name.toLowerCase().includes(query)) {
        return true;
      }

      // Search by player names
      return team.players.some((player: any) =>
        player.name.toLowerCase().includes(query)
      );
    });
  }, [teams, searchQuery]);

  return (
    <div className="p-4">
      <div>
        <h1>Teams Management</h1>
        <p className="text-muted-foreground">Manage teams and their players</p>
      </div>

      <div className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Add New Team</CardTitle>
            <CardDescription>Create a new team for the league</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) =>
                addTeam(
                  e,
                  newTeamName,
                  selectedLeague,
                  setIsAddingTeam,
                  setNewTeamName,
                  setTeams
                )
              }
              className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={isAddingTeam}
              >
                Add Team
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5">
        <Card>
        <CardHeader>
          <CardTitle>Search Teams</CardTitle>
          <CardDescription>Search by team name or player name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-input-background border border-input rounded-md px-3 py-2 w-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search teams or players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {isLoadingSkeleton ? (
        <div className="grid gap-4 mt-5">
          {Array.from({ length: 31 }).map((_, index) => (
            <Card key={index} className="p-4 space-y-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Skeleton className="h-5 w-32" />
                    </CardTitle>
                    <div className='mt-5'>
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6 mt-5">
          <div className="grid gap-4">
            {filteredTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team?.players?.length} players</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {team.name !== "BLIND" && (
                        <Dialog open={dialogOpen && selectedTeam === team.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) {
                            setSelectedTeam(team.id);
                            setSelectedTeamName(team.name);
                            setAddMode('single');
                          }
                          if (!open) {
                            setNewPlayerName('');
                            setMultiplePlayerNames('');
                            setSelectedTeam(null);
                            setSelectedTeamName('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" style={{borderStyle: 'var(--tw-border-style)', borderWidth: '1px', borderRadius: '8px', borderColor: '#0000001a'}}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Player
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="sm:max-w-[500px]"
                            aria-describedby={undefined}
                            onPointerDownOutside={(e) => e.preventDefault()}
                            onInteractOutside={(e) => e.preventDefault()}
                          >
                            <DialogHeader>
                              <DialogTitle>Add Player(s) to {team.name}</DialogTitle>
                              <DialogDescription>Choose to add a single player or multiple players at once</DialogDescription>
                            </DialogHeader>
                            
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
                                  onSubmit={(e) =>
                                    addPlayer(
                                      e,
                                      'single',
                                      selectedTeam,
                                      selectedTeamName,
                                      newPlayerName,
                                      multiplePlayerNames,
                                      setNewPlayerName,
                                      setMultiplePlayerNames,
                                      setDialogOpen,
                                      setTeams,
                                      selectedLeague
                                    )
                                  }
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
                                    <Button type="submit">Add Player</Button>
                                  </DialogFooter>
                                </form>
                              </TabsContent>

                              <TabsContent value="multiple">
                                <form
                                  onSubmit={(e) =>
                                    addPlayer(
                                      e,
                                      'multiple',
                                      selectedTeam,
                                      selectedTeamName,
                                      newPlayerName,
                                      multiplePlayerNames,
                                      setNewPlayerName,
                                      setMultiplePlayerNames,
                                      setDialogOpen,
                                      setTeams,
                                      selectedLeague
                                    )
                                  }
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
                                    <Button type="submit">Add Players</Button>
                                  </DialogFooter>
                                </form>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          askConfirm(
                            `Delete team ${team.name}?`,
                            () => deleteTeam(team.id, setTeams, selectedLeague),
                            setConfirmMessage,
                            setConfirmAction,
                            setConfirmOpen
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {team.players.length > 0 && (
                  <Collapsible
                    open={expandedTeams[team.id] ?? false}
                    onOpenChange={(open) => setExpandedTeams(prev => ({ ...prev, [team.id]: open }))}
                  >
                    <div className="border-t border-border px-6 py-3 bg-muted/30">
                      <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
                        <span className="text-sm">
                          {team.players.length} {team.players.length === 1 ? 'Player' : 'Players'}
                        </span>
                        {expandedTeams[team.id] ?? true ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-[25%]'>Player Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {team.players.map((player: any) => (
                              <TableRow key={player.id}>
                                <TableCell>{player.name}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={player.status === "active" ? "success" : "secondary"}
                                    className={
                                      player.status === "active"
                                        ? "bg-green-500/20 text-green-600 border-green-500/30"
                                        : "bg-red-500/20 text-red-600 border-red-500/30"
                                    }
                                  >
                                    {(player.status).toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingPlayer(player);
                                      setEditedName(player.name);
                                      setEditedStatus(player.status || 'Active');
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      askConfirm(
                                        `Delete player ${player.name}?`,
                                        () => deletePlayer(player.id, setTeams, selectedLeague),
                                        setConfirmMessage,
                                        setConfirmAction,
                                        setConfirmOpen
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </Card>
            ))}
            <ConfirmDialog
              open={confirmOpen}
              title="Confirm Action"
              message={confirmMessage}
              onConfirm={() => {
                confirmAction?.();
                setConfirmOpen(false);
              }}
              onCancel={() => setConfirmOpen(false)}
            />
            <div className="flex gap-2">
              <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
                <DialogContent
                  onInteractOutside={(e) => e.preventDefault()} 
                  onEscapeKeyDown={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Edit Player</DialogTitle>
                    <DialogDescription>
                      Update the details for player <b>{editingPlayer?.name}</b>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input
                      id="playerName"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter new player name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerStatus">Status</Label>
                    <Select
                      value={editedStatus}
                      onValueChange={(e) => setEditedStatus(e)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditingPlayer(null)}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          const result = await updatePlayer(
                            editingPlayer.id,
                            editedName,
                            editedStatus,
                            selectedLeague,
                            setTeams
                          );

                          if (result) {
                            setEditingPlayer(null);
                          }
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={!editedName.trim() || isSaving}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {teams.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No teams yet. Add your first team above.</p>
              </CardContent>
            </Card>
          )}

          {teams.length > 0 && filteredTeams.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No teams match your search query.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
