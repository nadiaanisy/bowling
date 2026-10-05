import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/accordion';
import { Badge } from '../../components/badge';
import { Card, CardContent } from '../../components/card';
import ScoreTeamSection from './TeamSection';
import SaveMatchButton from './SaveMatchButton';

type ScoreMatchCardProps = {
  match: any;
  index: number;
  gamesPerWeek: number;
  playersPerGame: number;
  scores: any[];
  activePlayers: any;
  selectedPlayerDropdown: any;
  playerScores: any;
  savedMatches: number[];
  selectedLeague: string | number | null;
  weekInScores: string;
  blockNumber: number | null;
  setActivePlayers: any;
  setSelectedPlayerDropdown: any;
  setPlayerScores: any;
  setScores: any;
  setIsLoadingSkeleton: any;
  setSavedMatches: any;
};

export default function ScoreMatchCard({
  match,
  index,
  gamesPerWeek,
  playersPerGame,
  scores,
  activePlayers,
  selectedPlayerDropdown,
  playerScores,
  savedMatches,
  selectedLeague,
  weekInScores,
  blockNumber,
  setActivePlayers,
  setSelectedPlayerDropdown,
  setPlayerScores,
  setScores,
  setIsLoadingSkeleton,
  setSavedMatches,
}: ScoreMatchCardProps) {
  const team1 = match.team1;
  const team2 = match.team2;
  const bothScoreEntered = match.hasScore;

  return (
    <AccordionItem value={`match-${index}`} className="border rounded-lg">
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
              <ScoreTeamSection
                matchIndex={index}
                teamNumber={1}
                team={team1}
                gamesPerWeek={gamesPerWeek}
                playersPerGame={playersPerGame}
                scores={scores}
                activePlayers={activePlayers}
                selectedPlayerDropdown={selectedPlayerDropdown}
                playerScores={playerScores}
                setActivePlayers={setActivePlayers}
                setSelectedPlayerDropdown={setSelectedPlayerDropdown}
                setPlayerScores={setPlayerScores}
              />

              <ScoreTeamSection
                matchIndex={index}
                teamNumber={2}
                team={team2}
                gamesPerWeek={gamesPerWeek}
                playersPerGame={playersPerGame}
                scores={scores}
                activePlayers={activePlayers}
                selectedPlayerDropdown={selectedPlayerDropdown}
                playerScores={playerScores}
                setActivePlayers={setActivePlayers}
                setSelectedPlayerDropdown={setSelectedPlayerDropdown}
                setPlayerScores={setPlayerScores}
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <SaveMatchButton
                index={index}
                match={match}
                weekInScores={weekInScores}
                blockNumber={blockNumber}
                selectedLeague={selectedLeague}
                gamesPerWeek={gamesPerWeek}
                activePlayers={activePlayers}
                playerScores={playerScores}
                savedMatches={savedMatches}
                setPlayerScores={setPlayerScores}
                setScores={setScores}
                setIsLoadingSkeleton={setIsLoadingSkeleton}
                setSavedMatches={setSavedMatches}
              />
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
