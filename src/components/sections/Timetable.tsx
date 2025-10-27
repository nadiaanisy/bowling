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
  fetchAllMatches,
  fetchAllTeams,
  fetchBlocksData,
  handleAddMatch
} from '../functions';
import { useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useCustomHook} from '../misc';
import { Skeleton } from '../ui/skeleton';

export default function Timetable() {
  const {
    blocksData,
    setBlocksData,
    teams,
    setTeams,
    blockNumber,
    setBlockNumber,
    week,
    setWeek,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    block1Data,
    setBlock1Data,
    block2Data,
    setBlock2Data,
    team1,
    setTeam1,
    team2,
    setTeam2,
    selectedLane,
    setSelectedLane,
    usedTeamBlock1,
    setUsedTeamBlock1,
    usedTeamBlock2,
    setUsedTeamBlock2,
    usedLanesBlock1,
    setUsedLanesBlock1,
    usedLanesBlock2,
    setUsedLanesBlock2
  } = useCustomHook();

  // Current block and week as numbers
  const currentWeek = parseInt(week);

  useEffect(() => {
    const loadBlocks = async () => {
      setIsLoadingSkeleton(true);
      const data = await fetchBlocksData();
      setBlocksData(data);
      setIsLoadingSkeleton(false);
    }
    
    const loadAllTeams = async () => {
      setIsLoadingSkeleton(true);
      const data = await fetchAllTeams();
      setTeams(data);
      setIsLoadingSkeleton(false);
    }

    const loadAllMatches = async () => {
      setIsLoadingSkeleton(true);
      const { block1, block2 } = await fetchAllMatches();
      setBlock1Data(block1);
      setBlock2Data(block2);

      const groupByWeek = (matches: any) =>
        matches.reduce((acc: any, match: any) => {
          const week = match.week_number;
          if (!acc[week]) acc[week] = { teams: [], lanes: [] };
          acc[week].teams.push(String(match.team1_id), String(match.team2_id));
          acc[week].lanes.push(match.lane);
          return acc;
        }, {});

      // Block 1
      const grouped1 = groupByWeek(block1);
      setUsedTeamBlock1(grouped1);
      setUsedLanesBlock1(grouped1);

      // Block 2
      const grouped2 = groupByWeek(block2);
      setUsedTeamBlock2(grouped2);
      setUsedLanesBlock2(grouped2);
    }

    loadBlocks();
    loadAllTeams();
    loadAllMatches();
  }, []);

  const refreshMatches = async () => {
    const { block1, block2 } = await fetchAllMatches();
    setBlock1Data(block1);
    setBlock2Data(block2);

    // Group by week
    const groupByWeek = (matches: any) =>
      matches.reduce((acc: any, match: any) => {
        const week = match.week_number;
        if (!acc[week]) acc[week] = { teams: [], lanes: [] };
        acc[week].teams.push(String(match.team1_id), String(match.team2_id));
        acc[week].lanes.push(match.lane);
        return acc;
      }, {});

    // Block 1
    const grouped1 = groupByWeek(block1);
    setUsedTeamBlock1(grouped1);
    setUsedLanesBlock1(grouped1);

    // Block 2
    const grouped2 = groupByWeek(block2);
    setUsedTeamBlock2(grouped2);
    setUsedLanesBlock2(grouped2);
  };

  const usedTeams =
  blockNumber === 1
    ? usedTeamBlock1[currentWeek]?.teams || []
    : usedTeamBlock2[currentWeek]?.teams || [];

const usedLanes =
  blockNumber === 1
    ? usedLanesBlock1[currentWeek]?.lanes || []
    : usedLanesBlock2[currentWeek]?.lanes || [];

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
                handleAddMatch(
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
                  setSelectedLane
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
                  <CardDescription>
                    <Skeleton className="h-4 w-32" />
                  </CardDescription>
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
            // defaultValue="block2"
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
                  {block1Data && block1Data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>vs</TableHead>
                          <TableHead>Team 2</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {block1Data
                          .sort((a, b) => a.week - b.week)
                          .map((match, idx) => (
                            <TableRow key={idx}>
                              <TableCell>Week {match.week_number}</TableCell>
                              <TableCell>{match.team1_name}</TableCell>
                              <TableCell>vs</TableCell>
                              <TableCell>{match.team2_name}</TableCell>
                              <TableCell>
                                {match.team1_scores && match.team2_scores ? (
                                  <span className="text-green-600">Completed</span>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </TableCell>
                              <TableCell>{match.team1_scores} - {match.team2_scores}</TableCell>
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
            <TabsContent value="block2">
              <Card>
                <CardHeader>
                  <CardTitle>Block 2 Schedule</CardTitle>
                  <CardDescription>Weeks 32-62</CardDescription>
                </CardHeader>
                <CardContent>
                  {block2Data && block2Data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>vs</TableHead>
                          <TableHead>Team 2</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {block2Data
                          .sort((a, b) => a.week - b.week)
                          .map((match, idx) => (
                            <TableRow key={idx}>
                              <TableCell>Week {match.week_number}</TableCell>
                              <TableCell>{match.team1_name}</TableCell>
                              <TableCell>vs</TableCell>
                              <TableCell>{match.team2_name}</TableCell>
                              <TableCell>
                                {match.team1_scores && match.team2_scores ? (
                                  <span className="text-green-600">Completed</span>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </TableCell>
                              <TableCell>{match.team1_scores} - {match.team2_scores}</TableCell>
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
