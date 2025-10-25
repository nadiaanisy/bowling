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
  TabsList,TabsTrigger
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
  Trash2,
  UserPlus,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../utils/supabaseClient';
import { useCustomHook } from '../others/misc';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { players_table, teams_table } from '../others/data';

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
    teams,
    setTeams,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    dialogOpen,
    setDialogOpen,
    selectedTeam,
    setSelectedTeam,
    newPlayerName,
    setNewPlayerName,
    multiplePlayerNames,
    setMultiplePlayerNames,
    confirmOpen,
    setConfirmOpen,
    confirmMessage,
    setConfirmMessage,
    confirmAction,
    setConfirmAction,
    addMode,
    setAddMode,
    newTeamName,
    setNewTeamName,
    selectedLeague,
    expandedTeams,
    setExpandedTeams
  } = useCustomHook();

  /* Fetch Team List & Players List */
  const fetchTeamsAndPlayers= async () => {
    try {
      setIsLoadingSkeleton(true);
      const { data, error } = await supabase
        .from(teams_table)
        .select(`
          id,
          name,
          players(
            id,
            name
          )
        `);

      const teamsWithCount = data?.map(team => ({
        ...team,
        total_players: team.players?.length || 0
      }));
      if (error) {
        toast.error('Error fetching teams: ' + error.message);
        return;
      }
      setTeams(teamsWithCount || [])
    } catch (error) {
      toast.error('Error fetching teams: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoadingSkeleton(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndPlayers();
  }, []);

  const askConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      try {
        const { error } = await supabase
          .from(teams_table)
          .insert([{ name: newTeamName, league_id: selectedLeague }]);
          
          if (error) {
            toast.error('Error adding team: ' + error.message);
            return;
          }
          await fetchTeamsAndPlayers();
          toast.success(`${newTeamName} added successfully!`);
      } catch (error) {
        toast.error('Unexpected error: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setNewTeamName('');
      }
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from(teams_table)
        .delete()
        .eq('id', teamId);

      if (error) {
        toast.error('Error deleting team: ' + error.message);
        return;
      }

      toast.success('Team deleted successfully!');
      fetchTeamsAndPlayers();
    } catch (err) {
      toast.error('Error deleting team: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleAddPlayer = (mode: 'single' | 'multiple') => async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'single') {
      if (selectedTeam && newPlayerName.trim()) {
        try {
          const { error } = await supabase
            .from(players_table)
            .insert([{ name: newPlayerName, team_id: selectedTeam }]);
          
          if (error) {
            toast.error('Error adding player: ' + error.message);
            return;
          }
          await fetchTeamsAndPlayers();
          toast.success(`${newPlayerName} added successfully!`);
        } catch (error) {
          toast.error('Unexpected error: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
          setNewPlayerName('');
          setDialogOpen(false);
        }
      }
    } else {
      if (selectedTeam && multiplePlayerNames.trim()) {
        try {
          const names = multiplePlayerNames
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

          if (names.length > 0) {
            const playersToInsert = names.map(name => ({
              name,
              team_id: selectedTeam
            }));

            const { error } = await supabase
              .from(players_table)
              .insert(playersToInsert);

            if (error) {
              toast.error('Error adding player: ' + error.message);
              return;
            }
          }

          await fetchTeamsAndPlayers();
          toast.success(`Multiple players added successfully!`);
        } catch (error) {
          toast.error('Unexpected error: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
          setMultiplePlayerNames('');
          setDialogOpen(false);
        }
      }
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from(players_table)
        .delete()
        .eq('id', playerId);

      if (error) {
        toast.error('Error deleting player: ' + error.message);
        return;
      }

      toast.success('Player deleted successfully!');
      fetchTeamsAndPlayers();
    } catch (err) {
      toast.error('Error deleting player: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (isLoadingSkeleton) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Teams Management</h1>
        <p className="text-muted-foreground">Manage teams and their players</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Team</CardTitle>
          <CardDescription>Create a new team for the league</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTeam} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <Button type="submit">Add Team</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
       {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>{team?.players?.length} players</CardDescription>
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
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
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
                          <form onSubmit={handleAddPlayer('single')}>
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
                          <form onSubmit={handleAddPlayer('multiple')}>
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
                   <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      askConfirm(`Delete team ${team.name}?`, () => deleteTeam(team.id));
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
                          <TableHead>Player Name</TableHead>
                          <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.players.map((player: any) => (
                          <TableRow key={player.id}>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  askConfirm(`Delete player ${player.name}?`, () => deletePlayer(player.id));
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
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No teams yet. Add your first team above.</p>
          </CardContent>
        </Card>
      )} 
    </div>
  );
}