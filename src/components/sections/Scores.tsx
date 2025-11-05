import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  getAllBlocksByLeagueId,
  getAllMatchesDataByWeekAndBlock,
  getWeeksByBlocks
} from '../api/get';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  calculatePlayerTotal,
  calculatePlayerTotalHdc,
  calculateTeamColumnTotals,
  calculateTeamTotalsFromData,
  handleGetActivePlayersForTeam,
  handleGetAvailablePlayers,
  handleBlockChanged,
  handleHdcChange,
  handleScoreChange,
  handleWeekChanged,
  handleAddPlayerToMatch,
  handleRemovePlayerFromMatch
} from '../functions';
import {
  Accordion, 
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useCustomHook } from '../misc';
import { addMatchResults } from '../api/add';

export default function Scores() {
  const {
    blockNumber,
    weekInScores,
    scores,
    activePlayers,
    blocksData,
    weeksAvailable,
    isLoadingSkeleton,
    selectedPlayerDropdown,
    playerScores,
    savedMatches,
    selectedLeague,
    setBlockNumber,
    setWeekInScores,
    setScores,
    setActivePlayers,
    setBlocksData,
    setWeeksAvailable,
    setIsLoadingSkeleton,
    setSelectedPlayerDropdown,
    setPlayerScores,
    setSavedMatches
  } = useCustomHook();

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSkeleton(true);
      const blockslist = await getAllBlocksByLeagueId(selectedLeague);
      setBlocksData(blockslist);

      const weekslist = await getWeeksByBlocks(blockNumber, selectedLeague);
      setWeeksAvailable(weekslist);

      const matchesList = await getAllMatchesDataByWeekAndBlock(weekInScores, blockNumber, selectedLeague);
      setScores(matchesList);

      setIsLoadingSkeleton(false);
    };

    loadData();
  }, [blockNumber, weekInScores]);

  return (
    <div className="p-4">
      <div>
        <h1>Score Input</h1>
        <p className="text-muted-foreground">
          Enter and manage scores for each week
        </p>
      </div>

      <div className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Select Match</CardTitle>
            <CardDescription>Choose a block and week to input scores</CardDescription>
          </CardHeader>
          <CardContent>
            < div className="grid gap-4 md:grid-cols-2">
              {/* Block Selector */}
              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Select
                  value={blockNumber?.toString() || ''}
                  onValueChange={(v) => handleBlockChanged(
                    parseInt(v) as 1 | 2,
                    (val: number) => setBlockNumber(val as 1 | 2),
                    setWeekInScores,
                    setScores,
                    setActivePlayers
                  )}
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

              {/* Week Selector (depends on block) */}
              <div className="space-y-2">
                <Label htmlFor="week">Week</Label>
                <Select
                  value={weekInScores || ''} // show placeholder when week is empty
                  onValueChange={(val) => handleWeekChanged(
                    val,
                    setWeekInScores,
                    setScores,
                    setActivePlayers,
                  )}
                  disabled={!blockNumber || weeksAvailable.length === 0}
                >
                  <SelectTrigger id="week">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeksAvailable.length > 0 ? (
                      weeksAvailable.map((w) => (
                        <SelectItem key={w} value={w.toString()}>
                          Week {w}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="none">
                        No weeks found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {scores && scores.length > 0 ? (
          <div className="space-y-4 mt-10">
            <div className="flex items-center justify-between">
              <h2>Week {weekInScores} Matches</h2>
              <Badge variant="secondary">{scores.length} {scores.length === 1 ? 'Match' : 'Matches'}</Badge>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {scores.map((match: any, index: any) => {
                const team1 = match.team1;
                const team2 = match.team2;
                const bothScoreEntered = match.hasScore;
                const team1Totals = calculateTeamColumnTotals(
                  handleGetActivePlayersForTeam(index, 1, team1, activePlayers),
                  playerScores,
                  index,
                  1
                );
                const team2Totals = calculateTeamColumnTotals(
                  handleGetActivePlayersForTeam(index, 2, team2, activePlayers),
                  playerScores,
                  index,
                  2
                );
                const perGameHdct1 = team1Totals.hdc / 3;
                const totalg1t1 = team1Totals.g1 + perGameHdct1;
                const totalg2t1 = team1Totals.g2 + perGameHdct1;
                const totalg3t1 = team1Totals.g3 + perGameHdct1;

                const perGameHdct2 = team2Totals.hdc / 3;
                const totalg1t2 = team2Totals.g1 + perGameHdct2;
                const totalg2t2 = team2Totals.g2 + perGameHdct2;
                const totalg3t2 = team2Totals.g3 + perGameHdct2;

                const team1TotalsFromData = calculateTeamTotalsFromData(team1);
                const team2TotalsFromData = calculateTeamTotalsFromData(team2);

                return (
                  <AccordionItem
                    key={index}
                    value={`match-${index}`}
                    className="border rounded-lg"
                  >
                    <Card>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <span>{team1.name}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span>{team2.name}</span>
                          </div>
                          {bothScoreEntered && (
                          <Badge variant="outline" className="ml-4">
                              Scores Entered
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <CardContent className="pt-4 space-y-6">
                          <div className="grid gap-6 lg:grid-cols-2">
                            {/* Team 1 */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3>{team1.name}</h3>
                                {/* {totalScoreTeam1 > 0 && (
                                  <Badge variant="secondary">
                                    Total: {totalScoreTeam1}
                                  </Badge>
                                )} */}
                              </div>

                              {team1.name === "BLIND" ? (
                                // Render 4 default players for BLIND team
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Player</TableHead>
                                      <TableHead>G1</TableHead>
                                      <TableHead>G2</TableHead>
                                      <TableHead>G3</TableHead>
                                      <TableHead>Scratch</TableHead>
                                      <TableHead>HDC</TableHead>
                                      <TableHead>Total</TableHead>
                                      <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Array.from({ length: 4 }, (_, i) => {
                                      const playerId = `blind${i + 1}`;
                                      const playerName = `Player ${i + 1}`;
                                      const defaultScore = { game1: "120", game2: "120", game3: "120", hdc: "0" };
                                      const currentScores = scores[index]?.team1?.[playerId] || defaultScore;
                                      return (
                                        <TableRow key={playerId} style={{ height: 48.67 }}>
                                          <TableCell>{playerName}</TableCell>
                                          <TableCell>{currentScores.game1}</TableCell>
                                          <TableCell>{currentScores.game2}</TableCell>
                                          <TableCell>{currentScores.game3}</TableCell>
                                          <TableCell>
                                            {parseInt(currentScores.game1) + parseInt(currentScores.game2) + parseInt(currentScores.game3)}
                                          </TableCell>
                                          <TableCell>{currentScores.hdc}</TableCell>
                                          <TableCell>
                                            {parseInt(currentScores.game1) + parseInt(currentScores.game2) + parseInt(currentScores.game3) + parseInt(currentScores.hdc)}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                  <TableFooter>
                                    <TableRow>
                                      <TableCell>Total Scratch Pins</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Total Hdc</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Total Result</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>1440</TableCell>
                                    </TableRow>
                                  </TableFooter>
                                </Table>
                              ) : (
                                <>
                                {/* Add Player Section */}
                                {team1 && !team1.hasScore && handleGetAvailablePlayers(index, 1, team1, activePlayers).length > 0 && (
                                  <div className="flex gap-2">
                                    <Select
                                      value={selectedPlayerDropdown[index]?.[1] || ''}
                                      onValueChange={(playerId) => handleAddPlayerToMatch(index, 1, playerId, setActivePlayers, setSelectedPlayerDropdown)}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select player to add" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {handleGetAvailablePlayers(index, 1, team1, activePlayers).map((player: any) => (
                                          <SelectItem key={player.id} value={player.id}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Players Table */}
                                {team1 && team1.hasScore ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead>G1</TableHead>
                                        <TableHead>G2</TableHead>
                                        <TableHead>G3</TableHead>
                                        <TableHead>Scratch</TableHead>
                                        <TableHead>HDC</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {team1.players
                                        .filter((player: any) => player.g1 || player.g2 || player.g3 || player.hdc)
                                        .map((player: any) => (
                                        <TableRow key={player.id}>
                                          <TableCell>{player.name}</TableCell>
                                          <TableCell className={player.g1 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g1}</TableCell>
                                          <TableCell className={player.g2 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g2}</TableCell>
                                          <TableCell className={player.g3 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g3}</TableCell>
                                          <TableCell>{player.scratch}</TableCell>
                                          <TableCell>{player.hdc}</TableCell>
                                          <TableCell>{player.totalHdc}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleRemovePlayerFromMatch(
                                                  index,
                                                  1,
                                                  player.id,
                                                  activePlayers,
                                                  setActivePlayers,
                                                  playerScores,
                                                  setPlayerScores,
                                                  setSelectedPlayerDropdown
                                                )
                                              }
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                    <TableFooter>
                                      <TableRow>
                                        <TableCell>Total Scratch Pins</TableCell>
                                        <TableCell>{team1TotalsFromData.g1}</TableCell>
                                        <TableCell>{team1TotalsFromData.g2}</TableCell>
                                        <TableCell>{team1TotalsFromData.g3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Hdc</TableCell>
                                        <TableCell>{team1TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell>{team1TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell>{team1TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{team1TotalsFromData.hdc}</TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Result</TableCell>
                                        <TableCell>{team1TotalsFromData.g1 + (team1TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell>{team1TotalsFromData.g2 + (team1TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell>{team1TotalsFromData.g3 + (team1TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{team1TotalsFromData.total}</TableCell>
                                      </TableRow>
                                    </TableFooter>
                                  </Table>
                                ) : team1 && !team1.hasScore && handleGetActivePlayersForTeam(index, 1, team1, activePlayers).length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead>G1</TableHead>
                                        <TableHead>G2</TableHead>
                                        <TableHead>G3</TableHead>
                                        <TableHead>Scratch</TableHead>
                                        <TableHead>HDC</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {handleGetActivePlayersForTeam(index, 1, team1, activePlayers).map((player: any) => (
                                        <TableRow key={player.id}>
                                          <TableCell>{player.name}</TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team1?.[player.id]?.game1 || ''}
                                              onChange={(e) => handleScoreChange(index, 1, player.id, 1, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team1?.[player.id]?.game2 || ''}
                                              onChange={(e) => handleScoreChange(index, 1, player.id, 2, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team1?.[player.id]?.game3 || ''}
                                              onChange={(e) => handleScoreChange(index, 1, player.id, 3, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>{calculatePlayerTotal(playerScores[index]?.team1?.[player.id] || {})}</TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="40"
                                              className="w-20"
                                              value={playerScores[index]?.team1?.[player.id]?.hdc || ''}
                                              onChange={(e) => handleHdcChange(index, 1, player.id, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>{calculatePlayerTotalHdc(playerScores[index]?.team1?.[player.id] || {})}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemovePlayerFromMatch(index, 1, player.id, activePlayers, setActivePlayers, playerScores, setPlayerScores, setSelectedPlayerDropdown)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                    <TableFooter>
                                      <TableRow>
                                        <TableCell>Total Scratch Pins</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 1, team1, activePlayers), playerScores, index, 1).g1}</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 1, team1, activePlayers), playerScores, index, 1).g2}</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 1, team1, activePlayers), playerScores, index, 1).g3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Hdc</TableCell>
                                        <TableCell>{perGameHdct1}</TableCell>
                                        <TableCell>{perGameHdct1}</TableCell>
                                        <TableCell>{perGameHdct1}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 1, team1, activePlayers), playerScores, index, 1).hdc}</TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Result</TableCell>
                                        <TableCell>{totalg1t1}</TableCell>
                                        <TableCell>{totalg2t1}</TableCell>
                                        <TableCell>{totalg3t1}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 1, team1, activePlayers), playerScores, index, 1).total}</TableCell>
                                      </TableRow>
                                    </TableFooter>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                      <>{team1 && team1.players.length > 0 
                                        ? 'No players added yet. Select players from the dropdown above.'
                                        : 'No players in this team'}
                                    </>
                                  </p>
                                )}
                                </>
                              )}
                            </div>

                            {/* Team 2 */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3>{team2.name}</h3>
                                {/* {totalScoreTeam2 > 0 && (
                                  <Badge variant="secondary">
                                    Total: {totalScoreTeam2}
                                  </Badge>
                                )} */}
                              </div>

                              {team2.name === "BLIND" ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Player</TableHead>
                                      <TableHead>G1</TableHead>
                                      <TableHead>G2</TableHead>
                                      <TableHead>G3</TableHead>
                                      <TableHead>Scratch</TableHead>
                                      <TableHead>HDC</TableHead>
                                      <TableHead>Total</TableHead>
                                      <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Array.from({ length: 4 }, (_, i) => {
                                      const playerId = `blind${i + 1}`;
                                      const playerName = `Player ${i + 1}`;
                                      const defaultScore = { game1: "120", game2: "120", game3: "120", hdc: "0" };
                                      const currentScores = scores[index]?.team2?.[playerId] || defaultScore;

                                      return (
                                        <TableRow key={playerId} style={{ height: 48.67 }}>
                                          <TableCell>{playerName}</TableCell>
                                          <TableCell>{currentScores.game1}</TableCell>
                                          <TableCell>{currentScores.game2}</TableCell>
                                          <TableCell>{currentScores.game3}</TableCell>
                                          <TableCell>
                                            {parseInt(currentScores.game1) + parseInt(currentScores.game2) + parseInt(currentScores.game3)}
                                          </TableCell>
                                          <TableCell>{currentScores.hdc}</TableCell>
                                          <TableCell>
                                            {parseInt(currentScores.game1) + parseInt(currentScores.game2) + parseInt(currentScores.game3) + parseInt(currentScores.hdc)}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                  <TableFooter>
                                    <TableRow>
                                      <TableCell>Total Scratch Pins</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Total Hdc</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>0</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Total Result</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell>480</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>1440</TableCell>
                                    </TableRow>
                                  </TableFooter>
                                </Table>
                              ) : (
                                <>
                                {/* Add Player Section */}
                                {team2 && !team2.hasScore && handleGetAvailablePlayers(index, 2, team2, activePlayers).length > 0 && (
                                  <div className="flex gap-2">
                                    <Select
                                      value={selectedPlayerDropdown[index]?.[2] || ''}
                                      onValueChange={(playerId) =>
                                        handleAddPlayerToMatch(index, 2, playerId, setActivePlayers, setSelectedPlayerDropdown)
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select player to add" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {handleGetAvailablePlayers(index, 2, team2, activePlayers).map((player: any) => (
                                          <SelectItem key={player.id} value={player.id}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Players Table */}
                                {team2 && team2.hasScore ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead>G1</TableHead>
                                        <TableHead>G2</TableHead>
                                        <TableHead>G3</TableHead>
                                        <TableHead>Scratch</TableHead>
                                        <TableHead>HDC</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {team2.players
                                        .filter((player: any) => player.g1 || player.g2 || player.g3 || player.hdc)
                                        .map((player: any) => (
                                        <TableRow key={player.id}>
                                          <TableCell>{player.name}</TableCell>
                                          <TableCell className={player.g1 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g1}</TableCell>
                                          <TableCell className={player.g2 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g2}</TableCell>
                                          <TableCell className={player.g3 >= 200 ? "text-red-500 font-semibold" : ""}>{player.g3}</TableCell>
                                          <TableCell>{player.scratch}</TableCell>
                                          <TableCell>{player.hdc}</TableCell>
                                          <TableCell>{player.totalHdc}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleRemovePlayerFromMatch(
                                                  index,
                                                  2,
                                                  player.id,
                                                  activePlayers,
                                                  setActivePlayers,
                                                  playerScores,
                                                  setPlayerScores,
                                                  setSelectedPlayerDropdown
                                                )
                                              }
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                    <TableFooter>
                                      <TableRow>
                                        <TableCell>Total Scratch Pins</TableCell>
                                        <TableCell>{team2TotalsFromData.g1}</TableCell>
                                        <TableCell>{team2TotalsFromData.g2}</TableCell>
                                        <TableCell>{team2TotalsFromData.g3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Hdc</TableCell>
                                        <TableCell>{team2TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell>{team2TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell>{team2TotalsFromData.hdc / 3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{team2TotalsFromData.hdc}</TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Result</TableCell>
                                        <TableCell>{team2TotalsFromData.g1 + (team2TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell>{team2TotalsFromData.g2 + (team2TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell>{team2TotalsFromData.g3 + (team2TotalsFromData.hdc / 3)}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{team2TotalsFromData.total}</TableCell>
                                      </TableRow>
                                    </TableFooter>
                                  </Table>
                                ) : team2 && !team2.hasScore && handleGetActivePlayersForTeam(index, 2, team2, activePlayers).length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead>G1</TableHead>
                                        <TableHead>G2</TableHead>
                                        <TableHead>G3</TableHead>
                                        <TableHead>Scratch</TableHead>
                                        <TableHead>HDC</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {handleGetActivePlayersForTeam(index, 2, team2, activePlayers).map((player: any) => (
                                        <TableRow key={player.id}>
                                          <TableCell>{player.name}</TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team2?.[player.id]?.game1 || ''}
                                              onChange={(e) => handleScoreChange(index, 2, player.id, 1, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team2?.[player.id]?.game2 || ''}
                                              onChange={(e) => handleScoreChange(index, 2, player.id, 2, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="300"
                                              className="w-20"
                                              value={playerScores[index]?.team2?.[player.id]?.game3 || ''}
                                              onChange={(e) => handleScoreChange(index, 2, player.id, 3, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>{calculatePlayerTotal(playerScores[index]?.team2?.[player.id] || {})}</TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="40"
                                              className="w-20"
                                              value={playerScores[index]?.team2?.[player.id]?.hdc || ''}
                                              onChange={(e) => handleHdcChange(index, 2, player.id, e.target.value, setPlayerScores)}
                                            />
                                          </TableCell>
                                          <TableCell>{calculatePlayerTotalHdc(playerScores[index]?.team2?.[player.id] || {})}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleRemovePlayerFromMatch(
                                                  index,
                                                  2,
                                                  player.id,
                                                  activePlayers,
                                                  setActivePlayers,
                                                  playerScores,
                                                  setPlayerScores,
                                                  setSelectedPlayerDropdown
                                                )
                                              }
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                    <TableFooter>
                                      <TableRow>
                                        <TableCell>Total Scratch Pins</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 2, team2, activePlayers), playerScores, index, 2).g1}</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 2, team2, activePlayers), playerScores, index, 2).g2}</TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 2, team2, activePlayers), playerScores, index, 2).g3}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Hdc</TableCell>
                                        <TableCell>{perGameHdct2}</TableCell>
                                        <TableCell>{perGameHdct2}</TableCell>
                                        <TableCell>{perGameHdct2}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 2, team2, activePlayers), playerScores, index, 2).hdc}</TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Result</TableCell>
                                        <TableCell>{totalg1t2}</TableCell>
                                        <TableCell>{totalg2t2}</TableCell>
                                        <TableCell>{totalg3t2}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{calculateTeamColumnTotals(handleGetActivePlayersForTeam(index, 2, team2, activePlayers), playerScores, index, 2).total}</TableCell>
                                      </TableRow>
                                    </TableFooter>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    {team2 && team2.players.length > 0
                                      ? 'No players added yet. Select players from the dropdown above.'
                                      : 'No players in this team'}
                                  </p>
                                )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end pt-4 border-t">
                            {(() => {
                              const activeForTeam1 = handleGetActivePlayersForTeam(index, 1, team1, activePlayers) || [];
                              const activeForTeam2 = handleGetActivePlayersForTeam(index, 2, team2, activePlayers) || [];

                              const isActivePlayerComplete = (teamNum: 1 | 2, playerId: any) => {
                                const teamScores = playerScores?.[index]?.[`team${teamNum}`] || {};
                                const scoresObj = teamScores[playerId];
                                if (!scoresObj) return false;
                                const { game1, game2, game3 } = scoresObj;
                                return (
                                  game1 !== undefined && game1 !== '' &&
                                  game2 !== undefined && game2 !== '' &&
                                  game3 !== undefined && game3 !== ''
                                );
                              };

                              const team1AllActiveComplete =
                                activeForTeam1.length > 0 &&
                                activeForTeam1.every((p: any) => isActivePlayerComplete(1, p.id));

                              const team2AllActiveComplete =
                                activeForTeam2.length > 0 &&
                                activeForTeam2.every((p: any) => isActivePlayerComplete(2, p.id));

                              const team1IsBlind = team1?.name?.toLowerCase() === "blind";
                              const team2IsBlind = team2?.name?.toLowerCase() === "blind";

                              let canSave = false;
                              if (team1IsBlind && team2AllActiveComplete) canSave = true;
                              else if (team2IsBlind && team1AllActiveComplete) canSave = true;
                              else if (!team1IsBlind && !team2IsBlind && team1AllActiveComplete && team2AllActiveComplete)
                                canSave = true;

                              return (
                                <Button
                                  onClick={async () => {
                                    await addMatchResults(
                                      index,
                                      match,
                                      playerScores,
                                      setPlayerScores,
                                      async (week: any, block: any) => {
                                        const data = await getAllMatchesDataByWeekAndBlock(week, block, selectedLeague);
                                        if (data) setScores(data);
                                      },
                                      weekInScores,
                                      blockNumber,
                                      setIsLoadingSkeleton,
                                      activePlayers,
                                      selectedLeague
                                    );
                                    setSavedMatches((prev) => [...prev, index]);
                                  }}
                                  hidden={savedMatches.includes(index) || bothScoreEntered}
                                  disabled={!canSave}
                                  className={!canSave ? "opacity-50 cursor-not-allowed" : ""}
                                  title={
                                    !canSave
                                      ? team1IsBlind || team2IsBlind
                                        ? "Enter all scores for the non-blind team"
                                        : "All inserted players must have scores entered for both teams"
                                      : ""
                                  }
                                >
                                  Save Match Scores
                                </Button>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        ) : (
          <Card
            style={{ marginTop: 48 }}
          >
            <CardContent className="pt-6">
              {weekInScores ? (
                <p className="text-center text-muted-foreground">
                  No matches scheduled for Week {weekInScores}
                </p>
              ) : (
                <p className="text-center text-muted-foreground">
                  Please select a week to view match scores.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}