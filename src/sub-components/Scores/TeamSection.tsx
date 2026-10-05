import ScorePlayerSelector from './PlayerSelector';
import ScoreTable from './Table';
import BlindTeamTable from './BlindTeamTable';
import { handleGetActivePlayersForTeam } from '../../utils/functions/scores';

type ScoreTeamSectionProps = {
  matchIndex: number;
  teamNumber: 1 | 2;
  team: any;
  gamesPerWeek: number;
  playersPerGame: number;
  scores: any[];
  activePlayers: any;
  selectedPlayerDropdown: any;
  playerScores: any;
  setActivePlayers: any;
  setSelectedPlayerDropdown: any;
  setPlayerScores: any;
};

export default function ScoreTeamSection({
  matchIndex,
  teamNumber,
  team,
  gamesPerWeek,
  playersPerGame,
  scores,
  activePlayers,
  selectedPlayerDropdown,
  playerScores,
  setActivePlayers,
  setSelectedPlayerDropdown,
  setPlayerScores,
}: ScoreTeamSectionProps) {
  const activeTeamPlayers = handleGetActivePlayersForTeam(
    matchIndex,
    teamNumber,
    team,
    activePlayers,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3>{team.name}</h3>
      </div>

      {team.name === 'BLIND' ? (
        <BlindTeamTable
          matchIndex={matchIndex}
          teamNumber={teamNumber}
          gamesPerWeek={gamesPerWeek}
          playersPerGame={playersPerGame}
          scores={scores}
        />
      ) : (
        <>
          <ScorePlayerSelector
            matchIndex={matchIndex}
            teamNumber={teamNumber}
            team={team}
            activePlayers={activePlayers}
            selectedPlayerDropdown={selectedPlayerDropdown}
            playersPerGame={playersPerGame}
            setActivePlayers={setActivePlayers}
            setSelectedPlayerDropdown={setSelectedPlayerDropdown}
          />

          {team && (team.hasScore || activeTeamPlayers.length > 0) ? (
            <ScoreTable
              matchIndex={matchIndex}
              teamNumber={teamNumber}
              team={team}
              gamesPerWeek={gamesPerWeek}
              activePlayers={activePlayers}
              playerScores={playerScores}
              setActivePlayers={setActivePlayers}
              setPlayerScores={setPlayerScores}
              setSelectedPlayerDropdown={setSelectedPlayerDropdown}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {team && team.players.length > 0
                ? 'No players added yet. Select players from the dropdown above.'
                : 'No players in this team'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
