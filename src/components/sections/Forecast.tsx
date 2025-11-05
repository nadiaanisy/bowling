
import { useEffect,
  useMemo,
  useState
} from 'react';
import {
  getAllBlocksByLeagueId,
  getAllMatchesGroupedByMatchAndBlock,
  getAllTeamsByLeagueId,
  getPlayersByTeamId
} from '../api/get';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Alert,
  AlertDescription
} from '../ui/alert';
import {
  handlePlayerToggleA,
  handlePlayerToggleB
} from '../functions';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useCustomHook } from '../misc';
import { Progress } from '../ui/progress';
import { Activity, AlertCircle, Trophy, Users } from 'lucide-react';
import { Separator } from '../ui/separator';

export default function Forecast() {
  const {
    selectedLeague,
    setIsLoadingSkeleton,

    blockFilter,
    blocksData,
    teams,
    teamA,
    teamB,
    selectedPlayersA,
    selectedPlayersB,
    listSelectedTeamAPlayer,
    listSelectedTeamBPlayer,

    setBlockFilter,
    setBlocksData,
    setTeams,
    setTeamA,
    setTeamB,
    setSelectedPlayersA,
    setSelectedPlayersB,
    setListSelectedTeamAPlayer,
    setListSelectedTeamBPlayer,
  } = useCustomHook();

  const [allMatches, setAllMatches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSkeleton(true);

      const allBlocks = await getAllBlocksByLeagueId(selectedLeague);
      setBlocksData(allBlocks);

      const allTeams = await getAllTeamsByLeagueId(selectedLeague);
      setTeams(allTeams);


      /**try */
      const matches = await getAllMatchesGroupedByMatchAndBlock();
      setAllMatches(matches);



      setIsLoadingSkeleton(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!teamA) return;

    const fetchPlayersTeamA = async () => {
      const selectedTeamAPlayer = await getPlayersByTeamId(teamA);
      setListSelectedTeamAPlayer(selectedTeamAPlayer || []);
    };

    fetchPlayersTeamA();
  }, [teamA]);

  useEffect(() => {
    if (!teamB) return;

    const fetchPlayersTeamB = async () => {
      const selectedTeamBPlayer = await getPlayersByTeamId(teamB);
      setListSelectedTeamBPlayer(selectedTeamBPlayer || []);
    };

    fetchPlayersTeamB();
  }, [teamB]);

  const calculatePlayerStats = (playerId: string, relevantBlocks: any) => {
    let name = "";
    let totalPins = 0;
    let gamesPlayed = 0;
    const games: number[] = [];
    let hdc = 0;

    // Loop through all blocks and matches
    Object.values(relevantBlocks).forEach((blockMatches: any) => {
      blockMatches.forEach((match: any) => {
        // Combine players from both teams
        const allPlayers = [
          ...(match.team1?.players || []),
          ...(match.team2?.players || []),
        ];

        // Find the player by id
        const player = allPlayers.find((p: any) => p.id === playerId);

        if (player) {
          name = player.name || "Unknown";
          hdc = player.hdc ?? 0;

          // Some data may use g1/g2/g3 keys instead of game1/game2/game3
          const scores = [
            player.g1 ?? player.game1,
            player.g2 ?? player.game2,
            player.g3 ?? player.game3,
          ].filter((v) => typeof v === "number" && !isNaN(v));

          if (scores.length > 0) {
            games.push(...scores);
            totalPins += scores.reduce((a, b) => a + b, 0);
            gamesPlayed += scores.length;
          }
        }
      });
    });

    // --- Default if player has no games
    if (gamesPlayed === 0) {
      return {
        playerId,
        name: name || "Unknown",
        average: 16, // default baseline
        highGame: 16,
        lowGame: 16,
        consistency: 0,
        gamesPlayed: 0,
        totalPins: 0,
        hdc: hdc || 0,
      };
    }

    // --- Calculate stats
    const average = Math.round(totalPins / gamesPlayed);
    const highGame = Math.max(...games);
    const lowGame = Math.min(...games);
    const variance =
      games.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) / games.length;
    const consistency = Math.round(Math.sqrt(variance));

    // --- Return final stats
    return {
      playerId,
      name,
      average,
      highGame,
      lowGame,
      consistency,
      gamesPlayed,
      totalPins,
      hdc
    };
  };

  const getPlayerStats = (playerId: string) => {
    if (!allMatches || Object.keys(allMatches).length === 0) return null;

    const totalMatches = Object.values(allMatches).reduce(
      (sum, blockArray: any) => sum + blockArray.length,
      0
    );

    if (!totalMatches) return null;

    const relevantBlocks =
      blockFilter === "all"
        ? allMatches
        : Object.fromEntries(
            Object.entries(allMatches).filter(([key]) => key === `block${blockFilter}`)
          );

    const result = calculatePlayerStats(playerId, relevantBlocks);
    return result;
  };

  const selectedStatsA = useMemo(() => {
    return selectedPlayersA.map((id) => getPlayerStats(id)).filter(Boolean);
  }, [selectedPlayersA, blockFilter, allMatches]);

  const selectedStatsB = useMemo(() => {
    return selectedPlayersB.map((id) => getPlayerStats(id)).filter(Boolean);
  }, [selectedPlayersB, blockFilter, allMatches]);

  const forecast = useMemo(() => {
    if (!selectedStatsA.length || !selectedStatsB.length) return null;

    const teamAAverage = selectedStatsA.reduce((sum: any, s: any) => sum + s.average, 0) / selectedStatsA.length;
    const teamBAverage = selectedStatsB.reduce((sum: any, s: any) => sum + s.average, 0) / selectedStatsB.length;

    const teamAConsistency = selectedStatsA.reduce((sum: any, s: any) => sum + s.consistency, 0) / selectedStatsA.length;
    const teamBConsistency = selectedStatsB.reduce((sum: any, s: any) => sum + s.consistency, 0) / selectedStatsB.length;

    const teamAHighGame = Math.max(...selectedStatsA.map((s: any) => s.highGame));
    const teamBHighGame = Math.max(...selectedStatsB.map((s: any) => s.highGame));

    const teamAExperience = selectedStatsA.reduce(
      (sum: any, s: any) => sum + s.gamesPlayed,
      0
    );
    const teamBExperience = selectedStatsB.reduce(
      (sum: any, s: any) => sum + s.gamesPlayed,
      0
    );

    const teamAHdc = selectedStatsA.reduce(
      (sum: number, s: any) => sum + (s.hdc || 0),
      0
    );

    const teamBHdc = selectedStatsB.reduce(
      (sum: number, s: any) => sum + (s.hdc || 0),
      0
    );

    const teamATotalPins = selectedStatsA.reduce(
      (sum: number, s: any) => sum + (s.totalPins || 0),
      0
    );

    const teamBTotalPins = selectedStatsB.reduce(
      (sum: number, s: any) => sum + (s.totalPins || 0),
      0
    );

    const teamAScore =
      teamAAverage * 0.6 +
      teamAHighGame * 0.1 +
      teamAExperience * 0.05 -
      teamAConsistency * 0.25;

    const teamBScore =
      teamBAverage * 0.6 +
      teamBHighGame * 0.1 +
      teamBExperience * 0.05 -
      teamBConsistency * 0.25;

    const total = teamAScore + teamBScore;
    const teamAWinProb = Math.round((teamAScore / total) * 100);
    const teamBWinProb = 100 - teamAWinProb;

    const projectedScoreA = Math.round(teamATotalPins + teamAHdc);
    const projectedScoreB = Math.round(teamBTotalPins + teamBHdc);

    const predictedWinner = teamAWinProb === teamBWinProb ? Math.random() < 0.5 ? "A" : "B" : teamAWinProb > teamBWinProb ? "A" : "B";

    return {
      teamAAverage: Math.round(teamAAverage),
      teamBAverage: Math.round(teamBAverage),
      teamAConsistency: Math.round(teamAConsistency),
      teamBConsistency: Math.round(teamBConsistency),
      teamAHighGame,
      teamBHighGame,
      teamAExperience,
      teamBExperience,
      teamAWinProb,
      teamBWinProb,
      predictedWinner: predictedWinner,
      confidenceLevel: Math.abs(teamAWinProb - 50) * 2,
      total,
      projectedScoreA,
      projectedScoreB,
    };
  }, [selectedStatsA, selectedStatsB]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Match Forecast</h1>
        <p className="text-muted-foreground">Predict match outcomes based on player statistics</p>
      </div>

      {/* SELECTION SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Select Teams & Players</CardTitle>
          <CardDescription>Choose up to 4 players from each team to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Block Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Data Source</label>
              <Select value={blockFilter} onValueChange={(v) => setBlockFilter(v as '1' | '2' | 'all')}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Team A</label>
                <Select
                  value={teamA}
                  onValueChange={(v) => { setTeamA(v); setSelectedPlayersA([]); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team A" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        disabled={team.id === teamB}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {teamA && (
                <div className="border rounded-lg p-4 space-y-2">
                 <p className="text-sm mb-2">Select Players (max 4):</p>
                  {listSelectedTeamAPlayer.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No players in this team</p>
                  ) : (
                    listSelectedTeamAPlayer.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2"
                        style={{borderStyle: 'var(--tw-border-style)', borderWidth: '1px', borderRadius: '8px', borderColor: '#0000001a'}}
                      >
                         <Button
                          variant={selectedPlayersA.includes(player.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => selectedLeague && handlePlayerToggleA(player.id, selectedLeague, setSelectedPlayersA)}
                          className="w-full justify-start"
                        >
                          {player.name}
                          {selectedPlayersA.includes(player.id) && (
                            <Badge variant="secondary" className="ml-auto">
                              Selected
                            </Badge>
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Team B</label>
                <Select
                  value={teamB}
                  onValueChange={(v) => { setTeamB(v); setSelectedPlayersB([]); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team B" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        disabled={team.id === teamA}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {teamB && (
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm mb-2">Select Players (max 4):</p>
                  {listSelectedTeamBPlayer.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No players in this team</p>
                  ) : (
                    listSelectedTeamBPlayer.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2"
                        style={{borderStyle: 'var(--tw-border-style)', borderWidth: '1px', borderRadius: '8px', borderColor: '#0000001a'}}
                      >
                          <Button
                          variant={selectedPlayersB.includes(player.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => selectedLeague && handlePlayerToggleB(player.id, selectedLeague, setSelectedPlayersB)}
                          className="w-full justify-start"
                        >
                          {player.name}
                          {selectedPlayersB.includes(player.id) && (
                            <Badge variant="secondary" className="ml-auto">
                              Selected
                            </Badge>
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FORECAST RESULTS */}
      {forecast && (
        <>
        {/* Win Probability */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast Result</CardTitle>
            <CardDescription>Predicted winner based on averages (default 16 if no data)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <div className="text-2xl mb-2">{teams.find(t => t.id === teamA)?.name}</div>
                <div className="text-4xl mb-2">{forecast.teamAWinProb}%</div>
                <Progress value={forecast.teamAWinProb} className="h-3" />
              </div>

              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                <div className="text-sm text-muted-foreground">Predicted Winner</div>
                <div className="text-xl">
                  {forecast.predictedWinner === 'A' 
                    ? teams.find(t => t.id === teamA)?.name 
                    : teams.find(t => t.id === teamB)?.name}
                </div>
                <Badge variant="outline" className="mt-2">
                  {forecast.confidenceLevel > 60 ? 'High' : forecast.confidenceLevel > 30 ? 'Medium' : 'Low'} Confidence
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">{teams.find(t => t.id === teamB)?.name}</div>
                <div className="text-4xl mb-2">{forecast.teamBWinProb}%</div>
                <Progress value={forecast.teamBWinProb} className="h-3" />
              </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Projected Score A</div>
                <div className="text-2xl">{forecast.projectedScoreA}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Projected Score B</div>
                <div className="text-2xl">{forecast.projectedScoreB}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Expected Margin</div>
                <div className="text-2xl">{Math.abs(forecast.projectedScoreA - forecast.projectedScoreB)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Match Closeness</div>
                <div className="text-2xl">
                  {Math.abs(forecast.teamAWinProb - forecast.teamBWinProb) < 20 ? 'Very Close' : 
                    Math.abs(forecast.teamAWinProb - forecast.teamBWinProb) < 40 ? 'Moderate' : 'Decisive'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Statistical Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-center">Team A</TableHead>
                    <TableHead className="text-center">Team B</TableHead>
                    <TableHead className="text-center">Advantage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Average</TableCell>
                    <TableCell className="text-center">{forecast.teamAAverage}</TableCell>
                    <TableCell className="text-center">{forecast.teamBAverage}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={forecast.teamAAverage > forecast.teamBAverage ? 'default' : 'secondary'}>
                        {forecast.teamAAverage > forecast.teamBAverage ? 'Team A' : 
                        forecast.teamBAverage > forecast.teamAAverage ? 'Team B' : 'Even'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Consistency</TableCell>
                    <TableCell className="text-center">±{forecast.teamAConsistency}</TableCell>
                    <TableCell className="text-center">±{forecast.teamBConsistency}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={forecast.teamAConsistency < forecast.teamBConsistency ? 'default' : 'secondary'}>
                        {forecast.teamAConsistency < forecast.teamBConsistency ? 'Team A' : 
                        forecast.teamBConsistency < forecast.teamAConsistency ? 'Team B' : 'Even'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>High Game</TableCell>
                    <TableCell className="text-center">{forecast.teamAHighGame}</TableCell>
                    <TableCell className="text-center">{forecast.teamBHighGame}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={forecast.teamAHighGame > forecast.teamBHighGame ? 'default' : 'secondary'}>
                        {forecast.teamAHighGame > forecast.teamBHighGame ? 'Team A' : 
                        forecast.teamBHighGame > forecast.teamAHighGame ? 'Team B' : 'Even'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Experience</TableCell>
                    <TableCell className="text-center">{forecast.teamAExperience} games</TableCell>
                    <TableCell className="text-center">{forecast.teamBExperience} games</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={forecast.teamAExperience > forecast.teamBExperience ? 'default' : 'secondary'}>
                        {forecast.teamAExperience > forecast.teamBExperience ? 'Team A' : 
                        forecast.teamBExperience > forecast.teamAExperience ? 'Team B' : 'Even'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {forecast.confidenceLevel > 60 && (
                    <>
                      <strong>High Confidence Prediction:</strong> Based on the statistics, there's a clear performance difference between the teams. 
                      {forecast.predictedWinner === 'A' ? ' Team A' : ' Team B'} has the advantage in most key metrics.
                    </>
                  )}
                  {forecast.confidenceLevel > 30 && forecast.confidenceLevel <= 60 && (
                    <>
                      <strong>Moderate Confidence:</strong> The teams are fairly matched. The outcome will likely depend on day-to-day performance and consistency.
                    </>
                  )}
                  {forecast.confidenceLevel <= 30 && (
                    <>
                      <strong>Low Confidence:</strong> This is expected to be a very close match. Both teams have similar statistics, making the outcome unpredictable.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Scoring</span>
                    <span>{Math.round((forecast.teamAAverage / (forecast.teamAAverage + forecast.teamBAverage)) * 100)}% Team A</span>
                  </div>
                  <Progress value={(forecast.teamAAverage / (forecast.teamAAverage + forecast.teamBAverage)) * 100} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consistency Advantage</span>
                    <span>
                      {forecast.teamAConsistency < forecast.teamBConsistency ? 'Team A' : 
                        forecast.teamBConsistency < forecast.teamAConsistency ? 'Team B' : 'Even'}
                    </span>
                  </div>
                  <Progress 
                    value={forecast.teamAConsistency < forecast.teamBConsistency ? 70 : 30} 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High Score Potential</span>
                    <span>{Math.round((forecast.teamAHighGame / (forecast.teamAHighGame + forecast.teamBHighGame)) * 100)}% Team A</span>
                  </div>
                  <Progress value={(forecast.teamAHighGame / (forecast.teamAHighGame + forecast.teamBHighGame)) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team A Players</CardTitle>
              <CardDescription>{teams.find(t => t.id === teamA)?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Avg</TableHead>
                    <TableHead>High</TableHead>
                    <TableHead>Games</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStatsA.map((stat: any) => (
                    <TableRow key={stat.playerId}>
                      <TableCell>{stat.name}</TableCell>
                      <TableCell>{stat.average}</TableCell>
                      <TableCell>{stat.highGame}</TableCell>
                      <TableCell>{stat.gamesPlayed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team B Players</CardTitle>
              <CardDescription>{teams.find(t => t.id === teamB)?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Avg</TableHead>
                    <TableHead>High</TableHead>
                    <TableHead>Games</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStatsB.map((stat: any) => (
                    <TableRow key={stat.playerId}>
                      <TableCell>{stat.name}</TableCell>
                      <TableCell>{stat.average}</TableCell>
                      <TableCell>{stat.highGame}</TableCell>
                      <TableCell>{stat.gamesPlayed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {(!teamA || !teamB || selectedStatsA.length === 0 || selectedStatsB.length === 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Select both teams and at least one player from each team to see the match forecast.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}