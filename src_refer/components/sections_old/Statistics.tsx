import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useBowlingHook } from '../others/misc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function Statistics() {
  const { data } = useBowlingHook();

  const calculatePlayerStats = (blockNumber: 1 | 2) => {
    const block = data.blocks.find(b => b.number === blockNumber);
    if (!block) return [];

    const playerStats: Record<string, {
      name: string;
      teamName: string;
      games: number[];
      totalPins: number;
      gamesPlayed: number;
      average: number;
    }> = {};

    block.matches.forEach(match => {
      if (match.team1Scores) {
        match.team1Scores.forEach(score => {
          if (!playerStats[score.playerId]) {
            playerStats[score.playerId] = {
              name: score.playerName,
              teamName: match.team1Name,
              games: [],
              totalPins: 0,
              gamesPlayed: 0,
              average: 0
            };
          }
          playerStats[score.playerId].games.push(score.game1, score.game2, score.game3);
          playerStats[score.playerId].totalPins += score.total;
          playerStats[score.playerId].gamesPlayed += 3;
        });
      }

      if (match.team2Scores) {
        match.team2Scores.forEach(score => {
          if (!playerStats[score.playerId]) {
            playerStats[score.playerId] = {
              name: score.playerName,
              teamName: match.team2Name,
              games: [],
              totalPins: 0,
              gamesPlayed: 0,
              average: 0
            };
          }
          playerStats[score.playerId].games.push(score.game1, score.game2, score.game3);
          playerStats[score.playerId].totalPins += score.total;
          playerStats[score.playerId].gamesPlayed += 3;
        });
      }
    });

    return Object.values(playerStats).map(stat => ({
      ...stat,
      average: stat.gamesPlayed > 0 ? Math.round(stat.totalPins / stat.gamesPlayed) : 0,
      highGame: Math.max(...stat.games, 0)
    })).sort((a, b) => b.average - a.average);
  };

  const block1Stats = calculatePlayerStats(1);
  const block2Stats = calculatePlayerStats(2);

  const StatsTable = ({ stats }: { stats: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Games</TableHead>
          <TableHead>Scratch Total</TableHead>
          <TableHead>Average</TableHead>
          <TableHead>High Game</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.length > 0 ? (
          stats.map((stat, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{stat.name}</TableCell>
              <TableCell>{stat.teamName}</TableCell>
              <TableCell>{stat.gamesPlayed}</TableCell>
              <TableCell>{stat.totalPins}</TableCell>
              <TableCell>{stat.average}</TableCell>
              <TableCell>{stat.highGame}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No data available yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Statistics</h1>
        <p className="text-muted-foreground">Player statistics and standings</p>
      </div>

      <Tabs defaultValue="block2">
        <TabsList>
          <TabsTrigger value="block1">Block 1</TabsTrigger>
          <TabsTrigger value="block2">Block 2</TabsTrigger>
        </TabsList>

        <TabsContent value="block1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Block 1 Player Statistics</CardTitle>
              <CardDescription>Individual player performance for Block 1</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsTable stats={block1Stats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="block2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Block 2 Player Statistics</CardTitle>
              <CardDescription>Individual player performance for Block 2</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsTable stats={block2Stats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
