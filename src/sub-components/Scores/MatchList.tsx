import { Accordion } from '../../components/accordion';
import { Badge } from '../../components/badge';
import ScoreMatchCard from './MatchCard';

type ScoresMatchListProps = {
  scores: any[];
  weekInScores: string;
  gamesPerWeek: number;
  playersPerGame: number;
  activePlayers: any;
  selectedPlayerDropdown: any;
  playerScores: any;
  savedMatches: number[];
  selectedLeague: string | number | null;
  blockNumber: number | null;
  setActivePlayers: any;
  setSelectedPlayerDropdown: any;
  setPlayerScores: any;
  setScores: any;
  setIsLoadingSkeleton: any;
  setSavedMatches: any;
};

export default function ScoresMatchList({
  scores,
  weekInScores,
  gamesPerWeek,
  playersPerGame,
  activePlayers,
  selectedPlayerDropdown,
  playerScores,
  savedMatches,
  selectedLeague,
  blockNumber,
  setActivePlayers,
  setSelectedPlayerDropdown,
  setPlayerScores,
  setScores,
  setIsLoadingSkeleton,
  setSavedMatches,
}: ScoresMatchListProps) {
  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h2>Week {weekInScores} Matches</h2>
        <Badge variant="secondary">
          {scores.length} {scores.length === 1 ? 'Match' : 'Matches'}
        </Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {scores.map((match: any, index: number) => (
          <ScoreMatchCard
            key={index}
            match={match}
            index={index}
            gamesPerWeek={gamesPerWeek}
            playersPerGame={playersPerGame}
            scores={scores}
            activePlayers={activePlayers}
            selectedPlayerDropdown={selectedPlayerDropdown}
            playerScores={playerScores}
            savedMatches={savedMatches}
            selectedLeague={selectedLeague}
            weekInScores={weekInScores}
            blockNumber={blockNumber}
            setActivePlayers={setActivePlayers}
            setSelectedPlayerDropdown={setSelectedPlayerDropdown}
            setPlayerScores={setPlayerScores}
            setScores={setScores}
            setIsLoadingSkeleton={setIsLoadingSkeleton}
            setSavedMatches={setSavedMatches}
          />
        ))}
      </Accordion>
    </div>
  );
}
