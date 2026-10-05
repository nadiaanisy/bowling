import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { Trash2 } from 'lucide-react';
import {
  calculatePlayerTotal,
  calculatePlayerTotalHdc,
  calculateTeamColumnTotals,
  handleGetActivePlayersForTeam,
  handleHdcChange,
  handleRemovePlayerFromMatch,
  handleScoreChange,
} from '../../utils/functions/scores';

type ScoreTableProps = {
  matchIndex: number;
  teamNumber: 1 | 2;
  team: any;
  gamesPerWeek: number;
  activePlayers: any;
  playerScores: any;
  setActivePlayers: any;
  setPlayerScores: any;
  setSelectedPlayerDropdown: any;
};

export default function ScoreTable({
  matchIndex,
  teamNumber,
  team,
  gamesPerWeek,
  activePlayers,
  playerScores,
  setActivePlayers,
  setPlayerScores,
  setSelectedPlayerDropdown,
}: ScoreTableProps) {
  const isSaved = Boolean(team?.hasScore);

  const activeTeamPlayers = handleGetActivePlayersForTeam(
    matchIndex,
    teamNumber,
    team,
    activePlayers,
  );

  const players = isSaved
    ? (team?.players || []).filter(
        (player: any) =>
          player.hdc ||
          Array.from(
            { length: gamesPerWeek },
            (_, i) => player[`g${i + 1}`],
          ).some((score) => score),
      )
    : activeTeamPlayers;

  const totals = calculateTeamColumnTotals(
    isSaved ? team.players : activeTeamPlayers,
    playerScores,
    matchIndex,
    teamNumber,
    gamesPerWeek,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          {Array.from({ length: gamesPerWeek }, (_, i) => (
            <TableHead key={i}>G{i + 1}</TableHead>
          ))}
          <TableHead>Scratch</TableHead>
          <TableHead>HDC</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {players.map((player: any) => {
          if (isSaved) {
            return (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                {Array.from({ length: gamesPerWeek }, (_, i) => {
                  const gameNumber = i + 1;
                  const score = player[`g${gameNumber}`];
                  return (
                    <TableCell
                      key={gameNumber}
                      className={
                        score >= 200 ? 'text-red-500 font-semibold' : ''
                      }
                    >
                      {score}
                    </TableCell>
                  );
                })}
                <TableCell>{player.scratch}</TableCell>
                <TableCell>{player.hdc}</TableCell>
                <TableCell>{player.totalHdc}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemovePlayerFromMatch(
                        matchIndex,
                        teamNumber,
                        player.id,
                        activePlayers,
                        setActivePlayers,
                        playerScores,
                        setPlayerScores,
                        setSelectedPlayerDropdown,
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          }

          return (
            <TableRow key={player.id}>
              <TableCell>{player.name}</TableCell>
              {Array.from({ length: gamesPerWeek }, (_, i) => {
                const gameNumber = i + 1;
                return (
                  <TableCell key={gameNumber}>
                    <Input
                      type="number"
                      min="0"
                      max="300"
                      className="w-20"
                      value={
                        playerScores?.[matchIndex]?.[`team${teamNumber}`]?.[
                          player.id
                        ]?.[`game${gameNumber}`] || ''
                      }
                      onChange={(e) =>
                        handleScoreChange(
                          matchIndex,
                          teamNumber,
                          player.id,
                          gameNumber,
                          e.target.value,
                          setPlayerScores,
                        )
                      }
                    />
                  </TableCell>
                );
              })}
              <TableCell>
                {calculatePlayerTotal(
                  playerScores?.[matchIndex]?.[`team${teamNumber}`]?.[
                    player.id
                  ] || {},
                  gamesPerWeek,
                )}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="40"
                  className="w-20"
                  value={
                    playerScores?.[matchIndex]?.[`team${teamNumber}`]?.[
                      player.id
                    ]?.hdc || ''
                  }
                  onChange={(e) =>
                    handleHdcChange(
                      matchIndex,
                      teamNumber,
                      player.id,
                      e.target.value,
                      setPlayerScores,
                    )
                  }
                />
              </TableCell>
              <TableCell>
                {calculatePlayerTotalHdc(
                  playerScores?.[matchIndex]?.[`team${teamNumber}`]?.[
                    player.id
                  ] || {},
                  gamesPerWeek,
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleRemovePlayerFromMatch(
                      matchIndex,
                      teamNumber,
                      player.id,
                      activePlayers,
                      setActivePlayers,
                      playerScores,
                      setPlayerScores,
                      setSelectedPlayerDropdown,
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell>Total Scratch Pins</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, i) => {
            const gameNumber = i + 1;
            return (
              <TableCell key={gameNumber}>{totals[`g${gameNumber}`]}</TableCell>
            );
          })}
          <TableCell />
          <TableCell />
          <TableCell />
          <TableCell />
        </TableRow>

        <TableRow>
          <TableCell>Total Hdc</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, i) => (
            <TableCell key={i}>{totals.hdc / gamesPerWeek}</TableCell>
          ))}
          <TableCell />
          <TableCell>{totals.hdc}</TableCell>
          <TableCell />
          <TableCell />
        </TableRow>

        <TableRow>
          <TableCell>Total Result</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, i) => {
            const gameNumber = i + 1;
            const perGameHdc = totals.hdc / gamesPerWeek;
            return (
              <TableCell key={gameNumber}>
                {totals[`g${gameNumber}`] + perGameHdc}
              </TableCell>
            );
          })}
          <TableCell />
          <TableCell />
          <TableCell>{totals.total}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
