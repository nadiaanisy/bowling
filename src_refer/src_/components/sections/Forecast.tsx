import {
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  Swords,
  Trophy
} from 'lucide-react';
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
import { useCustomHook } from '../misc';
import {
  fetchAllTeams,
  fetchAllWeeklyScores,
  fetchBlocksData,
  fetchPlayersByTeamId
} from '../api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PlayerStat } from '../interface';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { calculatePlayerStats } from '../functions';

export default function Forecast() {
  const {
    setIsLoadingSkeleton,
    isLoadingSkeleton,
    setBlocksData,
    blocksData,
    teams,
    setTeams,
    setAllScoresData,
    allScoresData
  } = useCustomHook();

  const [data, setData] = useState<{
    teams: any[];
    blocks: any[];
  }>({ teams: [], blocks: [] })
  const [teamA, setTeamA] = useState<string>('');
  const [teamB, setTeamB] = useState<string>('');
  const [selectedPlayersA, setSelectedPlayersA] = useState<string[]>([]);
  const [selectedPlayersB, setSelectedPlayersB] = useState<string[]>([]);
  const [listSelectedTeamAPlayer, setListSelectedTeamAPlayer] = useState<any[]>([]);
  const [listSelectedTeamBPlayer, setListSelectedTeamBPlayer] = useState<any[]>([]);
  const [blockFilter, setBlockFilter] = useState<'1' | '2' | 'all'>('all');

  const [playerStatsA, setPlayerStatsA] = useState<PlayerStat[]>([]);
  const [playerStatsB, setPlayerStatsB] = useState<PlayerStat[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSkeleton(true);

      const allBlocks = await fetchBlocksData();
      setBlocksData(allBlocks);

      const allTeams = await fetchAllTeams();
      setTeams(allTeams);

      // const allPlayers = await fetchAllPlayers();
      // setPlayers(allPlayers);

      // const weekslist = await fetchAllWeeksOrByBlock(selectedBlock);
      // setWeeksAvailable(weekslist);

      // const allScoresData = await fetchAllWeeklyScores();
      // setAllScoresData(allScoresData);

      setIsLoadingSkeleton(false);
    };
  
    loadData();
  }, []);

  useEffect(() => {
    if (!teamA) return;

    const fetchPlayersTeamA = async () => {
      const selectedTeamAPlayer = await fetchPlayersByTeamId(teamA);
      setListSelectedTeamAPlayer(selectedTeamAPlayer || []);
    };

    fetchPlayersTeamA();
  }, [teamA]);

  useEffect(() => {
    if (!teamB) return;

    const fetchPlayersTeamB = async () => {
      const selectedTeamBPlayer = await fetchPlayersByTeamId(teamB);
      setListSelectedTeamBPlayer(selectedTeamBPlayer || []);
    };

    fetchPlayersTeamB();
  }, [teamB]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!teamA) return;
      const stats: PlayerStat[] = [];

      for (const player of listSelectedTeamAPlayer) {
        const stat: any = await calculatePlayerStats(player.id, player.name, teamA, teams.find(t => t.id === teamA)?.name || '');
        if (stat) stats.push(stat);
      }

      setPlayerStatsA(stats);
    };

    fetchStats();
  }, [teamA, listSelectedTeamAPlayer]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!teamB) return;
      const stats: PlayerStat[] = [];

      for (const player of listSelectedTeamBPlayer) {
        const stat: any = await calculatePlayerStats(player.id, player.name, teamB, teams.find(t => t.id === teamB)?.name || '');
        if (stat) stats.push(stat);
      }

      setPlayerStatsB(stats);
    };

    fetchStats();
  }, [teamB, listSelectedTeamBPlayer,]);
  
  const handlePlayerToggleA = (playerId: string) => {
    setSelectedPlayersA(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), playerId]; // Keep max 4
        }
        return [...prev, playerId];
      }
    });
  };

  const handlePlayerToggleB = (playerId: string) => {
    setSelectedPlayersB(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), playerId]; // Keep max 4
        }
        return [...prev, playerId];
      }
    });
  };

  const getPlayerStats = (playerId: string): PlayerStat | null => {
    // const blocks = blockFilter === 'all' 
    //   ? data.blocks 
    //   : data.blocks.filter(b => b.number.toString() === blockFilter);

    // let playerData = {
    //   games: [] as number[],
    //   totalPins: 0,
    //   gamesPlayed: 0,
    //   name: '',
    //   teamId: '',
    //   teamName: ''
    // };

    // blocks.forEach(block => {
    //   block.matches.forEach(match => {
    //     const team1Score = match.team1Scores?.find(s => s.playerId === playerId);
    //     const team2Score = match.team2Scores?.find(s => s.playerId === playerId);

    //     if (team1Score) {
    //       playerData.games.push(team1Score.game1, team1Score.game2, team1Score.game3);
    //       playerData.totalPins += team1Score.total;
    //       playerData.gamesPlayed += 3;
    //       playerData.name = team1Score.playerName;
    //       playerData.teamId = match.team1Id;
    //       playerData.teamName = match.team1Name;
    //     }

    //     if (team2Score) {
    //       playerData.games.push(team2Score.game1, team2Score.game2, team2Score.game3);
    //       playerData.totalPins += team2Score.total;
    //       playerData.gamesPlayed += 3;
    //       playerData.name = team2Score.playerName;
    //       playerData.teamId = match.team2Id;
    //       playerData.teamName = match.team2Name;
    //     }
    //   });
    // });

    // if (playerData.gamesPlayed === 0) return null;

    // const average = Math.round(playerData.totalPins / playerData.gamesPlayed);
    // const highGame = Math.max(...playerData.games, 0);
    // const lowGame = Math.min(...playerData.games);
    
    // // Calculate consistency (standard deviation)
    // const variance = playerData.games.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) / playerData.games.length;
    // const consistency = Math.round(Math.sqrt(variance));

    
    // return {
    //   playerId,
    //   name: playerData.name,
    //   teamId: playerData.teamId,
    //   teamName: playerData.teamName,
    //   average,
    //   highGame,
    //   lowGame,
    //   gamesPlayed: playerData.gamesPlayed,
    //   totalPins: playerData.totalPins,
    //   consistency,
    //   games: playerData.games
    // };
    return null;
  };

  const selectedStatsA = useMemo(() => {
    return playerStatsA.filter(p => selectedPlayersA.includes(p.playerId));
  }, [selectedPlayersA, playerStatsA]);

  const selectedStatsB = useMemo(() => {
    return playerStatsB.filter(p => selectedPlayersB.includes(p.playerId));
  }, [selectedPlayersB, playerStatsB]);

  // const selectedStatsA = useMemo(() => {
  //   return selectedPlayersA.map(id => getPlayerStats(id)).filter(Boolean) as PlayerStat[];
  // }, [selectedPlayersA, blockFilter, teams]);

  // const selectedStatsB = useMemo(() => {
  //   return selectedPlayersB.map(id => getPlayerStats(id)).filter(Boolean) as PlayerStat[];
  // }, [selectedPlayersB, blockFilter, teams]);

  const forecast = useMemo(() => {
    if (!selectedStatsA.length || !selectedStatsB.length) return null;

    const teamAAverage = selectedStatsA.reduce((sum, s) => sum + s.average, 0) / selectedStatsA.length;
    const teamBAverage = selectedStatsB.reduce((sum, s) => sum + s.average, 0) / selectedStatsB.length;

    const teamAHighGame = Math.max(...selectedStatsA.map(s => s.highGame));
    const teamBHighGame = Math.max(...selectedStatsB.map(s => s.highGame));

    const teamAScore = teamAAverage * 0.6 + teamAHighGame * 0.1;
    const teamBScore = teamBAverage * 0.6 + teamBHighGame * 0.1;

    const teamAWinProb = Math.round((teamAScore / (teamAScore + teamBScore)) * 100);
    const teamBWinProb = 100 - teamAWinProb;

    return { teamAWinProb, teamBWinProb, predictedWinner: teamAWinProb > teamBWinProb ? 'A' : 'B' };
  }, [selectedStatsA, selectedStatsB]);

    // if (selectedStatsA.length === 0 || selectedStatsB.length === 0) return null;

    // const teamAAverage = selectedStatsA.reduce((sum, s) => sum + s.average, 0) / selectedStatsA.length;
    // const teamBAverage = selectedStatsB.reduce((sum, s) => sum + s.average, 0) / selectedStatsB.length;
    
    // const teamAConsistency = selectedStatsA.reduce((sum, s) => sum + s.consistency, 0) / selectedStatsA.length;
    // const teamBConsistency = selectedStatsB.reduce((sum, s) => sum + s.consistency, 0) / selectedStatsB.length;

    // const teamAHighGame = Math.max(...selectedStatsA.map(s => s.highGame));
    // const teamBHighGame = Math.max(...selectedStatsB.map(s => s.highGame));

    // const teamAExperience = selectedStatsA.reduce((sum, s) => sum + s.gamesPlayed, 0);
    // const teamBExperience = selectedStatsB.reduce((sum, s) => sum + s.gamesPlayed, 0);

    // // Calculate win probability based on multiple factors
    // let teamAScore = 0;
    // let teamBScore = 0;

    // // Factor 1: Average (60% weight)
    // const avgDiff = teamAAverage - teamBAverage;
    // teamAScore += (avgDiff / (Math.abs(avgDiff) || 1)) * 60;
    // teamBScore += -(avgDiff / (Math.abs(avgDiff) || 1)) * 60;

    // // Factor 2: Consistency (20% weight) - lower is better
    // const consistencyDiff = teamBConsistency - teamAConsistency;
    // teamAScore += (consistencyDiff / (Math.abs(consistencyDiff) || 1)) * 20;
    // teamBScore += -(consistencyDiff / (Math.abs(consistencyDiff) || 1)) * 20;

    // // Factor 3: High game potential (10% weight)
    // const highGameDiff = teamAHighGame - teamBHighGame;
    // teamAScore += (highGameDiff / (Math.abs(highGameDiff) || 1)) * 10;
    // teamBScore += -(highGameDiff / (Math.abs(highGameDiff) || 1)) * 10;

    // // Factor 4: Experience (10% weight)
    // const expDiff = teamAExperience - teamBExperience;
    // teamAScore += (expDiff / (Math.abs(expDiff) || 1)) * 10;
    // teamBScore += -(expDiff / (Math.abs(expDiff) || 1)) * 10;

    // // Normalize to percentage
    // const totalScore = Math.abs(teamAScore) + Math.abs(teamBScore);
    // const teamAWinProb = Math.max(0, Math.min(100, ((teamAScore + 100) / 2)));
    // const teamBWinProb = 100 - teamAWinProb;

    // // Projected scores (average per game * 3 games per player)
    // const projectedScoreA = Math.round(teamAAverage * 3 * selectedStatsA.length);
    // const projectedScoreB = Math.round(teamBAverage * 3 * selectedStatsB.length);

    // return {
    //   teamAAverage: Math.round(teamAAverage),
    //   teamBAverage: Math.round(teamBAverage),
    //   teamAConsistency: Math.round(teamAConsistency),
    //   teamBConsistency: Math.round(teamBConsistency),
    //   teamAHighGame,
    //   teamBHighGame,
    //   teamAExperience,
    //   teamBExperience,
    //   teamAWinProb: Math.round(teamAWinProb),
    //   teamBWinProb: Math.round(teamBWinProb),
    //   projectedScoreA,
    //   projectedScoreB,
    //   predictedWinner: teamAWinProb > teamBWinProb ? 'A' : 'B',
    //   confidenceLevel: Math.abs(teamAWinProb - 50) * 2 // 0-100 scale
    // };
  // }, [selectedStatsA, selectedStatsB]);


  return (
    <div className="p-4">
      <div>
        <h1>Match Forecast</h1>
        <p className="text-muted-foreground">Predict match outcomes based on player statistics</p>
      </div>

      <div className="space-y-6 mt-5">
        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Teams & Players</CardTitle>
            <CardDescription>Choose up to 4 players from each team to compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm mb-2 block">Block</label>
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
                          onClick={() => handlePlayerToggleA(player.id)}
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
                          onClick={() => handlePlayerToggleB(player.id)}
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

        {/* Forecast Results */}
        {forecast 
        // && selectedStatsA.length > 0 && selectedStatsB.length > 0 
        && (
          <>
            {/* Win Probability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Match Prediction
                </CardTitle>
                <CardDescription>Based on historical performance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* <div className="text-center">
                    <div className="text-2xl mb-2">{data.teams.find(t => t.id === teamA)?.name}</div>
                    <div className="text-4xl mb-2">{forecast.teamAWinProb}%</div>
                    <Progress value={forecast.teamAWinProb} className="h-3" />
                  </div> */}

                  {/* <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                    <div className="text-sm text-muted-foreground">Predicted Winner</div>
                    <div className="text-xl">
                      {forecast.predictedWinner === 'A' 
                        ? data.teams.find(t => t.id === teamA)?.name 
                        : data.teams.find(t => t.id === teamB)?.name}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {forecast.confidenceLevel > 60 ? 'High' : forecast.confidenceLevel > 30 ? 'Medium' : 'Low'} Confidence
                    </Badge>
                  </div> */}

                  {/* <div className="text-center">
                    <div className="text-2xl mb-2">{data.teams.find(t => t.id === teamB)?.name}</div>
                    <div className="text-4xl mb-2">{forecast.teamBWinProb}%</div>
                    <Progress value={forecast.teamBWinProb} className="h-3" />
                  </div> */}
                </div>

                <Separator />

                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
                </div> */}
              </CardContent>
            </Card>

            {/* Detailed Comparison */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div> */}

            {/* Player Details */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team A Players</CardTitle>
                  <CardDescription>{data.teams.find(t => t.id === teamA)?.name}</CardDescription>
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
                      {selectedStatsA.map(stat => (
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
                  <CardDescription>{data.teams.find(t => t.id === teamB)?.name}</CardDescription>
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
                      {selectedStatsB.map(stat => (
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
            </div> */}
          </>
        )}


        {/* {(!teamA || !teamB || selectedStatsA.length === 0 || selectedStatsB.length === 0) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select both teams and at least one player from each team to see the match forecast.
            </AlertDescription>
          </Alert>
        )} */}
      </div>
    </div>
  );
}