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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Trophy,
  TrendingUp,
  Target
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useCustomHook } from '../misc';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchBlocksData,
  fetchAllTeams,
  fetchAllPlayers,
  fetchAllWeeksOrByBlock,
  fetchAllWeeklyScores,
} from '../api';
import { calculateConsistency } from '../functions';

export default function Statistics() {
  const {
    setBlocksData,
    blocksData,
    selectedBlock,
    setSelectedBlock,
    setTeams,
    teams,
    setPlayers,
    players,
    selectedTeamS,
    setSelectedTeamS,
    weeksAvailable,
    setWeeksAvailable,
    selectedWeek,
    setSelectedWeek,
    setIsLoadingSkeleton,
    isLoadingSkeleton,
    setAllScoresData,
    allScoresData
  } = useCustomHook();

  const [data, setData] = useState<{
    blocks: any[];
    teams: any[];
  }>({ blocks: [], teams: [] });

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSkeleton(true);

      const allBlocks = await fetchBlocksData();
      setBlocksData(allBlocks);

      const allTeams = await fetchAllTeams();
      setTeams(allTeams);

      const allPlayers = await fetchAllPlayers();
      setPlayers(allPlayers);

      const weekslist = await fetchAllWeeksOrByBlock(selectedBlock);
      setWeeksAvailable(weekslist);

      const allScoresData = await fetchAllWeeklyScores();
      setAllScoresData(allScoresData);

      setIsLoadingSkeleton(false);
    };

    loadData();
  }, []);

  //Player Stats
  const allStats = useMemo(() => {
    const stats: Record<string, any> = {};

    allScoresData.forEach((score: any) => {
      // Filter by block, team, week
      if (selectedBlock !== 'all' && score.block_id?.toString() !== selectedBlock) return;
      if (selectedTeamS !== 'all' && score.team_id !== selectedTeamS) return;
      if (selectedWeek !== 'all' && score.week_number?.toString() !== selectedWeek) return;

      if (!stats[score.player_id]) {
        stats[score.player_id] = {
          team_id: score.team_id,
          team_name: score.team_name,
          player_name: score.player_name,
          games: [],
          games_played: 0,
          total_scratch: 0,
          total_pins_hdc: 0,
          weeks: [],
          block: score.block_id
        };
      }

      stats[score.player_id].games.push(score.g1, score.g2, score.g3);
      stats[score.player_id].total_scratch += score.scratch; 
      stats[score.player_id].total_pins_hdc += score.total_hdc;
      stats[score.player_id].games_played += 3;

      if (!stats[score.player_id].weeks.includes(score.week_number)) {
        stats[score.player_id].weeks.push(score.week_number);
      }
    });

    return Object.entries(stats).map(([playerId, stat]: any) => ({
      player_id: playerId,
      ...stat,
      average: stat.games_played ? Math.round((stat.total_scratch / stat.games_played)).toFixed(2) : 0,
      high_game: Math.max(...stat.games, 0),
      low_game: stat.games.length ? Math.min(...stat.games) : 0,
      consistency: stat.games.length ? calculateConsistency(stat.games) : 0,
    }));
  }, [allScoresData, selectedBlock, selectedTeamS, selectedWeek]);

  // Team Stats
  const teamStats = useMemo(() => {
    const stats: Record<string, any> = {};

    // Group scores by match
    const matches: Record<string, any> = {}; // key = block_week_match
    allScoresData.forEach((score: any) => {
      if (selectedBlock !== 'all' && score.block_id?.toString() !== selectedBlock) return;
      if (selectedWeek !== 'all' && score.week_number?.toString() !== selectedWeek) return;

      const matchKey = `${score.block_id}_${score.week_number}_${score.match_id}`; // adjust if you have match_id
      if (!matches[matchKey]) matches[matchKey] = {};
      if (!matches[matchKey][score.team_id]) matches[matchKey][score.team_id] = 0;

      matches[matchKey][score.team_id] += score.scratch; // sum scratch for the team
    });

    // Calculate stats for each team
    Object.values(matches).forEach(match => {
      const teamIds = Object.keys(match).map(id => Number(id)); // convert to numbers
      if (teamIds.length === 0) return; // ignore incomplete match

      // Single team (vs BLIND)
      if (teamIds.length === 1) {
        const teamId = teamIds[0];

        // Initialize stats if not exist
        if (!stats[teamId]) {
          stats[teamId] = {
            team_name: allScoresData.find((s: any) => s.team_id === teamId)?.team_name || "BLIND",
            total_scratch: 0,
            average: 0,
            games_played: 0,
            wins: 0,
            losses: 0,
            matches_played: 0
          };
        }

        // Count as automatic win
        stats[teamId].wins += 1;
        stats[teamId].matches_played += 1;
        stats[teamId].total_scratch += match[teamId];

        const playersInTeam = allScoresData.filter((s: any) => s.team_id === teamId).length;
        stats[teamId].games_played += playersInTeam * 3;
    
        // Update average safely
        stats[teamId].average = stats[teamId].games_played ? (stats[teamId].total_scratch / stats[teamId].games_played).toFixed(2) : "0.00";

        return; // done with this match
      }
      // Normal 2-team match
      const [team1Id, team2Id] = teamIds;
      const team1Score = match[team1Id];
      const team2Score = match[team2Id];

      // Initialize stats
      if (!stats[team1Id]) stats[team1Id] = { team_name: allScoresData.find((s: any) => s.team_id === team1Id)?.team_name || "BLIND", total_scratch: 0, games_played: 0, wins: 0, losses: 0, matches_played: 0 };
      if (!stats[team2Id]) stats[team2Id] = { team_name: allScoresData.find((s: any) => s.team_id === team2Id)?.team_name || "BLIND", total_scratch: 0, games_played: 0, wins: 0, losses: 0, matches_played: 0 };

      // Add pins and games
      stats[team1Id].total_scratch += team1Score;
      stats[team2Id].total_scratch += team2Score;

      stats[team1Id].games_played += 3; // or total players * games
      stats[team2Id].games_played += 3;

      stats[team1Id].matches_played += 1;
      stats[team2Id].matches_played += 1;

      // Determine winner/loser
      if (team1Score > team2Score) {
        stats[team1Id].wins += 1;
        stats[team2Id].losses += 1;
      } else if (team2Score > team1Score) {
        stats[team2Id].wins += 1;
        stats[team1Id].losses += 1;
      }
    });

    return Object.entries(stats)
      .map(([teamId, stat]: any) => ({
        team_id: teamId,
          ...stat,
          average: stat.games_played ? (stat.total_scratch / stat.games_played).toFixed(2): "0.00",
          winRate: stat.matches_played ? Number(((stat.wins / stat.matches_played) * 100).toFixed(2)) : 0,
        }))
        .sort((a, b) => b.average - a.average);
  }, [allScoresData, selectedBlock, selectedWeek]);

  const highGameLeaders = useMemo(() => 
    [...allStats].sort((a, b) => {
      if (b.high_game !== a.high_game) {
        return b.high_game - a.high_game;
      }
      return b.average - a.average;
    }), 
    [allStats]
  );
  const averageLeaders = useMemo(() => [...allStats].sort((a, b) => b.average - a.average), [allStats]);

  const getWeekOptions = () => {
    const weeks = new Set<number>();
    allScoresData.forEach((score: any) => weeks.add(score.week_number));
    return Array.from(weeks).sort((a, b) => a - b);
  };

  return (
    <div className="p-4">
      <div>
        <h1>Statistics</h1>
        <p className="text-muted-foreground">Comprehensive player and team statistics</p>
      </div>

      {/* Filters */}
      <div className="space-y-6 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter statistics by block, team, and week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm mb-2 block">Block</label>
                <Select value={selectedBlock} onValueChange={(v) => setSelectedBlock(v as '1' | '2' | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocksData.map((block) => (
                      <SelectItem key={block.id} value={block.number.toString()}>
                        Block {block.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm mb-2 block">Team</label>
                <Select value={selectedTeamS} onValueChange={setSelectedTeamS}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm mb-2 block">Week</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {weeksAvailable.map(week => (
                      <SelectItem
                        key={week}
                        value={week.toString()}
                      >
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="players" className='mt-8'>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="highgames">High Games</TabsTrigger>
            <TabsTrigger value="leaders">Leaders</TabsTrigger>
          </TabsList>

          {/* Player Statistics */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Statistics</CardTitle>
                <CardDescription>
                  Individual performance metrics {selectedTeamS !== 'all' && `for ${data.teams.find(t => t.id === selectedTeamS)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Games</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>High Game</TableHead>
                      <TableHead>Low Game</TableHead>
                      <TableHead>Scratch Total</TableHead>
                      <TableHead>Consistency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allStats.length > 0 ? (
                      [...allStats].sort((a, b) => b.average - a.average).map((stat, idx) => (
                        <TableRow key={stat.player_id}>
                          <TableCell>
                            {idx === 0 && <Badge className="bg-yellow-500"><Trophy className="h-3 w-3 mr-1" />1st</Badge>}
                            {idx === 1 && <Badge className="bg-gray-400">2nd</Badge>}
                            {idx === 2 && <Badge className="bg-amber-600">3rd</Badge>}
                            {idx > 2 && <span>{idx + 1}</span>}
                          </TableCell>
                          <TableCell>{stat.player_name}</TableCell>
                          <TableCell>{stat.team_name}</TableCell>
                          <TableCell>{stat.games_played}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{stat.average}</span>
                              {stat.average >= 200 && <TrendingUp className="h-4 w-4 text-green-500" />}
                            </div>
                          </TableCell>
                          <TableCell>{stat.high_game}</TableCell>
                          <TableCell>{stat.low_game}</TableCell>
                          <TableCell>{stat.total_scratch}</TableCell>
                          <TableCell>
                            <span className={stat.consistency < 15 ? 'text-green-500' : stat.consistency < 25 ? 'text-yellow-500' : 'text-red-500'}>
                              ±{stat.consistency}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No data available for selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Statistics */}
          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
                <CardDescription>Team performance and standings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Wins</TableHead>
                      <TableHead>Losses</TableHead>
                      <TableHead>Win Rate</TableHead>
                      <TableHead>Games</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Total Pins</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamStats.length > 0 ? (
                      teamStats.map((stat, idx) => (
                        <TableRow key={stat.teamId}>
                          <TableCell>
                            {idx === 0 && <Badge className="bg-yellow-500"><Trophy className="h-3 w-3 mr-1" />1st</Badge>}
                            {idx === 1 && <Badge className="bg-gray-400">2nd</Badge>}
                            {idx === 2 && <Badge className="bg-amber-600">3rd</Badge>}
                            {idx > 2 && <span>{idx + 1}</span>}
                          </TableCell>
                        <TableCell>{stat.team_name}</TableCell>
                          <TableCell>{stat.matches_played}</TableCell>
                          <TableCell>{stat.wins}</TableCell>
                          <TableCell>{stat.losses}</TableCell>
                          <TableCell>
                            <Badge variant={stat.winRate >= 60 ? 'default' : 'secondary'}>
                              {stat.winRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>{stat.games_played}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(stat.average))}
                          </TableCell>
                          <TableCell>{stat.total_scratch}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No data available for selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* High Games */}
          <TabsContent value="highgames" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High Game Leaderboard</CardTitle>
                <CardDescription>Top individual game scores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>High Game</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Games Played</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highGameLeaders.length > 0 ? (
                      highGameLeaders.map((stat, idx) => (
                        <TableRow key={stat.player_id}>
                          <TableCell>
                            {idx === 0 && <Badge className="bg-yellow-500"><Trophy className="h-3 w-3 mr-1" />1st</Badge>}
                            {idx === 1 && <Badge className="bg-gray-400">2nd</Badge>}
                            {idx === 2 && <Badge className="bg-amber-600">3rd</Badge>}
                            {idx > 2 && <span>{idx + 1}</span>}
                          </TableCell>
                          <TableCell>{stat.player_name}</TableCell>
                          <TableCell>{stat.team_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{stat.high_game}</span>
                              {stat.high_game >= 250 && <Target className="h-4 w-4 text-red-500" />}
                              {stat.high_game >= 200 && stat.high_game < 250 && <Target className="h-4 w-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell>{stat.average}</TableCell>
                          <TableCell>{stat.games_played}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaders Board */}
          <TabsContent value="leaders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {averageLeaders.slice(0, 5).map((stat, idx) => (
                    <div key={stat.player_id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                          <span>{stat.player_name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stat.team_name}</span>
                      </div>
                      <Badge>{stat.average}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Top High Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {highGameLeaders.slice(0, 5).map((stat, idx) => (
                    <div key={stat.player_id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                          <span>{stat.player_name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stat.team_name}</span>
                      </div>
                      <Badge>{stat.high_game}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Most Consistent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {[...allStats].filter(s => s.games_played >= 9).length > 0 ? (
                    [...allStats]
                      .filter(s => s.games_played >= 9) // At least 3 matches
                      .sort((a, b) => a.consistency - b.consistency)
                      .slice(0, 5)
                      .map((stat, idx) => (
                        <div key={stat.player_id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">#{idx + 1}</span>
                              <span>{stat.player_name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{stat.team_name}</span>
                          </div>
                          <Badge variant="secondary">±{stat.consistency}</Badge>
                        </div>
                      ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      At least 3 matches are required to show stats
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};