import {
  useEffect,
  useState
} from 'react';
import {
  fetchAllTeams,
  fetchBlocksData,
  addMatch,
  fetchAllMatchesGroupedByMatchAndBlock,
  deleteMatch
} from '../api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useCustomHook} from '../misc';
import { MatchData } from '../interfaces';
import { Skeleton } from '../ui/skeleton';
import { errorToastStyle } from '../functions';

export default function Timetable() {
  const {
    isLoadingSkeleton,
    blocksData,
    blockNumber,
    teams,
    team1,
    team2,
    week,
    selectedLane,
    selectedLeague,
    setIsLoadingSkeleton,
    setBlocksData,
    setBlockNumber,
    setTeams,
    setTeam1,
    setTeam2,
    setWeek,
    setSelectedLane,
    setSelectedLeague
  }  = useCustomHook();

  // Current block and week as numbers
  const currentWeek = week ? parseInt(week) : 0;

  const [matches, setMatches] = useState<{ block1: MatchData[]; block2: MatchData[] }>({
    block1: [],
    block2: [],
  });

  const [usedTeams, setUsedTeams] = useState<string[]>([]);
  const [usedLanes, setUsedLanes] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSkeleton(true);

      // 1️⃣ Fetch blocks
      const blocks = await fetchBlocksData(selectedLeague);
      setBlocksData(blocks);

      // 2️⃣ Fetch teams
      const allTeams = await fetchAllTeams(selectedLeague);
      setTeams(allTeams);

      // 3️⃣ Fetch matches
      const data = await fetchAllMatchesGroupedByMatchAndBlock();
      setMatches(data);

      setIsLoadingSkeleton(false);
    }

    loadData();
  }, []);

  type BlockKey = 'block1' | 'block2';
  useEffect(() => {
    if (!matches || !blockNumber || !week) return;

    const blockKey: BlockKey = `block${blockNumber}` as BlockKey;
    const blockMatches = matches[blockKey] || [];

    // Filter matches for the selected week
    const filtered = blockMatches.filter(
      (m) => m.week_number === parseInt(week)
    );

    // Extract used lanes and team IDs
    const lanes = filtered.map((m) => m.lane);
    const teams = filtered.flatMap((m) => [m.team1.id.toString(), m.team2?.id?.toString()].filter(Boolean));

    setUsedLanes(lanes);
    setUsedTeams(teams);
  }, [matches, blockNumber, week]);

  // 🧹 Auto-clear invalid selections
  useEffect(() => {
    if (usedTeams.includes(team1)) setTeam1("");
    if (usedTeams.includes(team2)) setTeam2("");
    if (usedLanes.includes(selectedLane)) setSelectedLane("");
  }, [usedTeams, usedLanes]);

  const refreshMatches = async () => {
    setIsLoadingSkeleton(true);
    const data = await fetchAllMatchesGroupedByMatchAndBlock();
    setMatches(data);
    setIsLoadingSkeleton(false);
  };

  return (
    <div className="p-4">
      <div>
        <h1>Timetable / Schedule</h1>
        <p className="text-muted-foreground">
          Manage match schedules for each block
        </p>
      </div>

      <div className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Add Match to Schedule</CardTitle>
            <CardDescription>Schedule a match between two teams</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) =>
                addMatch(
                  e,
                  blockNumber,
                  week,
                  team1,
                  team2,
                  selectedLane,
                  currentWeek,
                  refreshMatches,
                  setWeek,
                  setTeam1,
                  setTeam2,
                  setSelectedLane,
                  selectedLeague
                )
              }
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Block Selector */}
                <div className="space-y-2">
                  <Label htmlFor="block">Block</Label>
                  <Select
                    value={blockNumber.toString()}
                    onValueChange={(v) => setBlockNumber(parseInt(v) as 1 | 2)}
                  >
                    <SelectTrigger id="block">
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocksData.map((block) => (
                        <SelectItem key={block.id} value={block.number.toString()}>
                          Block {block.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Week Input */}
                <div className="space-y-2">
                  <Label htmlFor="week">Week Number</Label>
                  <Input
                    id="week"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                  />
                </div>

                {/* Team 1 */}
                <div className="space-y-2">
                  <Label htmlFor="team1">Team 1</Label>
                  <Select value={team1} onValueChange={setTeam1}>
                    <SelectTrigger id="team1">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem
                          key={team.id}
                          value={team.id.toString()}
                          disabled={
                            team.id.toString() === team2 || usedTeams.includes(team.id.toString())
                          }
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team 2 */}
                <div className="space-y-2">
                  <Label htmlFor="team2">Team 2</Label>
                  <Select value={team2} onValueChange={setTeam2}>
                    <SelectTrigger id="team2">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem
                          key={team.id}
                          value={team.id.toString()}
                          disabled={
                            team.id.toString() === team1 || usedTeams.includes(team.id.toString())
                          }
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lane Selector */}
                <div className="space-y-2">
                  <Label htmlFor="lane">Lane</Label>
                  <Select value={selectedLane} onValueChange={setSelectedLane}>
                    <SelectTrigger id="lane">
                      <SelectValue placeholder="Select lane" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: (48 - 17 + 1) / 2 }, (_, i) => {
                        const start = 17 + i * 2;
                        const end = start + 1;
                        const value = `${start}-${end}`;

                        return (
                          <SelectItem
                            key={value}
                            value={value}
                            // disabled={isDisabled}
                            disabled={usedLanes.includes(value)}
                          >
                            Lane {start} - Lane {end}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit">Add Match</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {isLoadingSkeleton ? (
        <div className="space-y-6 mt-20">
          <div className="grid gap-4">
            {Array.from({ length: 1 }).map((_, index) => (
              <Card key={index} className="p-4">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-4 w-24" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Tabs
            value={`block${blockNumber}`}
            onValueChange={(val) => setBlockNumber(val === 'block1' ? 1 : 2)}
          >
            <TabsList>
              <TabsTrigger value="block1">Block 1</TabsTrigger>
              <TabsTrigger value="block2">Block 2</TabsTrigger>
            </TabsList>
            <TabsContent value="block1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Block 1 Schedule</CardTitle>
                  <CardDescription>Weeks 1-31</CardDescription>
                </CardHeader>
                <CardContent>
                  {matches?.block1 && matches?.block1.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Lane</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>Team 2</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.block1
                          .slice()
                          .sort((a, b) => a.week_number - b.week_number)
                          .map((match: MatchData, idx) => (
                          <TableRow key={idx}>
                            <TableCell>Week {match.week_number}</TableCell>
                            <TableCell>{match.lane}</TableCell>
                            <TableCell>{match.team1.name}</TableCell>
                            <TableCell>{match.team2.name}</TableCell>
                            <TableCell>{( match.hasScore ) ? (
                                <span className="text-green-600">Completed</span>
                              ) : (
                                <span className="text-muted-foreground">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Trash2 className="h-4 w-4" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the match from the schedule.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      variant='destructive'
                                      onClick={() => deleteMatch(match.match_id, refreshMatches)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No matches scheduled for Block 1</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="block2">
              <Card>
                <CardHeader>
                  <CardTitle>Block 2 Schedule</CardTitle>
                  <CardDescription>Weeks 32-62</CardDescription>
                </CardHeader>
                <CardContent>
                  {matches?.block2 && matches?.block2.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Lane</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>Team 2</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.block2
                          .slice()
                          .sort((a, b) => a.week_number - b.week_number)
                          .map((match: MatchData, idx) => (
                            <TableRow key={idx}>
                              <TableCell>Week {match.week_number}</TableCell>
                              <TableCell>{match.lane}</TableCell>
                              <TableCell>{match.team1.name}</TableCell>
                              <TableCell>{match.team2.name}</TableCell>
                              <TableCell>{(
                                  match.hasScore || 
                                  (match.team1.name === "BLIND" && !match.hasScore) || 
                                  (match.team2.name === "BLIND" && !match.hasScore)
                                ) ? (
                                  <span className="text-green-600">Completed</span>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger>
                                    <Trash2 className="h-4 w-4" />
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the match from the schedule.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        variant='destructive'
                                        onClick={() => deleteMatch(match.match_id, refreshMatches)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No matches scheduled for Block 2</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
