import { Button } from '../../components/button';
import { addMatchResults } from '../../utils/api/add';
import { getAllMatchesDataByWeekAndBlock } from '../../utils/api/get';
import { handleGetActivePlayersForTeam } from '../../utils/functions/scores';

type SaveMatchButtonProps = {
  index: number;
  match: any;
  weekInScores: string;
  blockNumber: number | null;
  selectedLeague: string | number | null;
  gamesPerWeek: number;
  activePlayers: any;
  playerScores: any;
  savedMatches: number[];
  setPlayerScores: any;
  setScores: any;
  setIsLoadingSkeleton: any;
  setSavedMatches: any;
};

export default function SaveMatchButton({
  index,
  match,
  weekInScores,
  blockNumber,
  selectedLeague,
  gamesPerWeek,
  activePlayers,
  playerScores,
  savedMatches,
  setPlayerScores,
  setScores,
  setIsLoadingSkeleton,
  setSavedMatches,
}: SaveMatchButtonProps) {
  const team1 = match.team1;
  const team2 = match.team2;

  const activeForTeam1 =
    handleGetActivePlayersForTeam(index, 1, team1, activePlayers) || [];
  const activeForTeam2 =
    handleGetActivePlayersForTeam(index, 2, team2, activePlayers) || [];

  const isActivePlayerComplete = (teamNum: 1 | 2, playerId: any) => {
    const teamScores = playerScores?.[index]?.[`team${teamNum}`] || {};
    const scoresObj = teamScores[playerId];
    if (!scoresObj) return false;

    return Array.from(
      { length: gamesPerWeek },
      (_, i) => scoresObj[`game${i + 1}`],
    ).every((score) => score !== undefined && score !== '');
  };

  const team1AllActiveComplete =
    activeForTeam1.length > 0 &&
    activeForTeam1.every((p: any) => isActivePlayerComplete(1, p.id));

  const team2AllActiveComplete =
    activeForTeam2.length > 0 &&
    activeForTeam2.every((p: any) => isActivePlayerComplete(2, p.id));

  const team1IsBlind = team1?.name?.toLowerCase() === 'blind';
  const team2IsBlind = team2?.name?.toLowerCase() === 'blind';

  let canSave = false;
  if (team1IsBlind && team2AllActiveComplete) canSave = true;
  else if (team2IsBlind && team1AllActiveComplete) canSave = true;
  else if (
    !team1IsBlind &&
    !team2IsBlind &&
    team1AllActiveComplete &&
    team2AllActiveComplete
  ) {
    canSave = true;
  }

  const isHidden = savedMatches.includes(index) || match.hasScore;

  return (
    <Button
      onClick={async () => {
        await addMatchResults(
          index,
          match,
          playerScores,
          setPlayerScores,
          async (week: any, block: any) => {
            const data = await getAllMatchesDataByWeekAndBlock(
              week,
              block,
              selectedLeague as string | number,
            );

            if (data) setScores(data);
          },
          weekInScores,
          blockNumber as number,
          setIsLoadingSkeleton,
          activePlayers,
          selectedLeague,
          gamesPerWeek,
        );

        setSavedMatches((prev: number[]) => [...prev, index]);
      }}
      hidden={isHidden}
      disabled={!canSave}
      className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}
      title={
        !canSave
          ? team1IsBlind || team2IsBlind
            ? 'Enter all scores for the non-blind team'
            : 'All inserted players must have scores entered for both teams'
          : ''
      }
    >
      Save Match Scores
    </Button>
  );
}
