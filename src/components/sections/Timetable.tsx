import {
  useEffect,
  useState,
  useMemo
} from 'react';
import {
  getAllBlocksByLeagueId,
  getAllMatchesGroupedByMatchAndBlock,
  getAllTeamsByLeagueId
} from '../api/get';
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
  Trash2,
  Filter
} from 'lucide-react';
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
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { addMatch } from '../api/add';
import { Button } from '../ui/button';
import { useCustomHook} from '../misc';
import { MatchData } from '../interfaces';
import { Skeleton } from '../ui/skeleton';
import { deleteMatch } from '../api/delete';

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
    filterWeek,
    filterTeam,
    filterStatus,
    setIsLoadingSkeleton,
    setBlocksData,
    setBlockNumber,
    setTeams,
    setTeam1,
    setTeam2,
    setWeek,
    setSelectedLane,
    setFilterWeek,
    setFilterTeam,
    setFilterStatus
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
      const blocks = await getAllBlocksByLeagueId(selectedLeague);
      setBlocksData(blocks);

      // 2️⃣ Fetch teams
      const allTeams = await getAllTeamsByLeagueId(selectedLeague);
      setTeams(allTeams);

      // 3️⃣ Fetch matches
      const data = await getAllMatchesGroupedByMatchAndBlock(selectedLeague);
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

  // Get unique weeks across all blocks
  const allWeeks = useMemo(() => {
    const weeks = new Set<number>();
    Object.values(matches).forEach((blockMatches) => {
      blockMatches?.forEach((match: any) => {
        if (match.week_number) weeks.add(match.week_number);
      });
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [matches]);

  // 🔍 Filter matches based on week, team, or status
  const getFilteredMatches = (blockNumber: number) => {
    const blockKey: BlockKey = `block${blockNumber}` as BlockKey;
    const blockMatches = matches?.[blockKey] || [];

    return blockMatches
      .filter((match) => {
        // Week filter
        if (filterWeek !== 'all' && match.week_number !== parseInt(filterWeek)) {
          return false;
        }

        // Team filter (check either side)
        if (
          filterTeam !== 'all' &&
          match.team1.id.toString() !== filterTeam &&
          match.team2.id.toString() !== filterTeam
        ) {
          return false;
        }

        // Status filter
        const isCompleted = !!match.hasScore;
        if (filterStatus === 'completed' && !isCompleted) return false;
        if (filterStatus === 'pending' && isCompleted) return false;

        return true;
      })
      .sort((a, b) => a.week_number - b.week_number);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterWeek('all');
    setFilterTeam('all');
    setFilterStatus('all');
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterWeek !== 'all') count++;
    if (filterTeam !== 'all') count++;
    if (filterStatus !== 'all') count++;
    return count;
  }, [filterWeek, filterTeam, filterStatus]);

  const refreshMatches = async () => {
    setIsLoadingSkeleton(true);
    const data = await getAllMatchesGroupedByMatchAndBlock(selectedLeague);
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

      <div className="mt-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Matches
                </CardTitle>
                <CardDescription>Filter matches by week, team, or status</CardDescription>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</Badge>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="filterWeek">Week</Label>
                <Select value={filterWeek} onValueChange={setFilterWeek}>
                  <SelectTrigger id="filterWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {allWeeks.map((weekNum) => (
                      <SelectItem key={weekNum} value={weekNum.toString()}>
                        Week {weekNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterTeam">Team</Label>
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger id="filterTeam">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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

            {/* 🟦 Block 1 */}
            <TabsContent value="block1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Block 1 Schedule</CardTitle>
                  <CardDescription>Weeks 1–31</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const filtered = getFilteredMatches(1);

                    if (filtered.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-8">
                          {matches?.block1?.length > 0
                            ? "No matches found for current filters"
                            : "No matches scheduled for Block 1"}
                        </p>
                      );
                    }

                    return (
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
                          {filtered.map((match: MatchData, idx) => (
                            <TableRow key={idx}>
                              <TableCell>Week {match.week_number}</TableCell>
                              <TableCell>{match.lane}</TableCell>
                              <TableCell>{match.team1.name}</TableCell>
                              <TableCell>{match.team2.name}</TableCell>
                              <TableCell>
                                {match.hasScore ? (
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
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently
                                        delete the match from the schedule.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        variant="destructive"
                                        onClick={() =>
                                          deleteMatch(match.match_id, refreshMatches)
                                        }
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
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🟩 Block 2 */}
            <TabsContent value="block2">
              <Card>
                <CardHeader>
                  <CardTitle>Block 2 Schedule</CardTitle>
                  <CardDescription>Weeks 32–62</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const filtered = getFilteredMatches(2);

                    if (filtered.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-8">
                          {matches?.block2?.length > 0
                            ? "No matches found for current filters"
                            : "No matches scheduled for Block 2"}
                        </p>
                      );
                    }

                    return (
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
                          {filtered.map((match: MatchData, idx) => (
                            <TableRow key={idx}>
                              <TableCell>Week {match.week_number}</TableCell>
                              <TableCell>{match.lane}</TableCell>
                              <TableCell>{match.team1.name}</TableCell>
                              <TableCell>{match.team2.name}</TableCell>
                              <TableCell>
                                {(match.hasScore ||
                                  (match.team1.name === "BLIND" && !match.hasScore) ||
                                  (match.team2.name === "BLIND" && !match.hasScore)) ? (
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
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently
                                        delete the match from the schedule.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        variant="destructive"
                                        onClick={() =>
                                          deleteMatch(match.match_id, refreshMatches)
                                        }
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
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

