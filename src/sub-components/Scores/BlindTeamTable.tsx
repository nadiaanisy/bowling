import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';

type BlindTeamTableProps = {
  matchIndex: number;
  gamesPerWeek: number;
  playersPerGame: number;
  scores: any[];
  teamNumber: 1 | 2;
};

export default function BlindTeamTable({
  matchIndex,
  gamesPerWeek,
  playersPerGame,
  scores,
  teamNumber,
}: BlindTeamTableProps) {
  const getDefaultScore = () => ({
    ...Object.fromEntries(
      Array.from({ length: gamesPerWeek }, (_, gameIndex) => [
        `game${gameIndex + 1}`,
        '120',
      ]),
    ),
    hdc: '0',
  });

  const getPlayerScores = (playerId: string) =>
    scores[matchIndex]?.[`team${teamNumber}`]?.[playerId] || getDefaultScore();

  const players = Array.from({ length: playersPerGame }, (_, i) => ({
    playerId: `blind${i + 1}`,
    playerName: `Player ${i + 1}`,
  }));

  const getGameTotal = (gameNumber: number) =>
    players.reduce(
      (total, { playerId }) =>
        total + (parseInt(getPlayerScores(playerId)[`game${gameNumber}`]) || 0),
      0,
    );

  const getPlayerScratch = (playerId: string) =>
    Array.from(
      { length: gamesPerWeek },
      (_, gameIndex) =>
        parseInt(getPlayerScores(playerId)[`game${gameIndex + 1}`]) || 0,
    ).reduce((total, score) => total + score, 0);

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
        </TableRow>
      </TableHeader>

      <TableBody>
        {players.map(({ playerId, playerName }) => {
          const currentScores = getPlayerScores(playerId);
          const scratch = getPlayerScratch(playerId);
          const hdc = parseInt(currentScores.hdc) || 0;

          return (
            <TableRow key={playerId} style={{ height: 48.67 }}>
              <TableCell>{playerName}</TableCell>
              {Array.from({ length: gamesPerWeek }, (_, gameIndex) => {
                const gameNumber = gameIndex + 1;
                return (
                  <TableCell key={gameNumber}>
                    {currentScores[`game${gameNumber}`]}
                  </TableCell>
                );
              })}
              <TableCell>{scratch}</TableCell>
              <TableCell>{currentScores.hdc}</TableCell>
              <TableCell>{scratch + hdc}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell>Total Scratch Pins</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, gameIndex) => (
            <TableCell key={gameIndex}>{getGameTotal(gameIndex + 1)}</TableCell>
          ))}
          <TableCell />
          <TableCell />
          <TableCell />
        </TableRow>

        <TableRow>
          <TableCell>Total Hdc</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, i) => (
            <TableCell key={i}>0</TableCell>
          ))}
          <TableCell />
          <TableCell>0</TableCell>
          <TableCell />
        </TableRow>

        <TableRow>
          <TableCell>Total Result</TableCell>
          {Array.from({ length: gamesPerWeek }, (_, gameIndex) => (
            <TableCell key={gameIndex}>{getGameTotal(gameIndex + 1)}</TableCell>
          ))}
          <TableCell />
          <TableCell />
          <TableCell>
            {players.reduce(
              (total, { playerId }) => total + getPlayerScratch(playerId),
              0,
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
