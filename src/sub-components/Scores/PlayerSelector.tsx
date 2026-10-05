import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import {
  handleAddPlayerToMatch,
  handleGetAvailablePlayers,
} from '../../utils/functions/scores';

type ScorePlayerSelectorProps = {
  matchIndex: number;
  teamNumber: 1 | 2;
  team: any;
  activePlayers: any;
  selectedPlayerDropdown: any;
  playersPerGame: number;
  setActivePlayers: any;
  setSelectedPlayerDropdown: any;
};

export default function ScorePlayerSelector({
  matchIndex,
  teamNumber,
  team,
  activePlayers,
  selectedPlayerDropdown,
  playersPerGame,
  setActivePlayers,
  setSelectedPlayerDropdown,
}: ScorePlayerSelectorProps) {
  const availablePlayers = handleGetAvailablePlayers(
    matchIndex,
    teamNumber,
    team,
    activePlayers,
  );

  const activeCount = Array.isArray(
    activePlayers?.[matchIndex]?.[`team${teamNumber}`],
  )
    ? activePlayers[matchIndex][`team${teamNumber}`].length
    : 0;

  if (
    team?.hasScore ||
    activeCount >= playersPerGame ||
    availablePlayers.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Select
        value={selectedPlayerDropdown?.[matchIndex]?.[teamNumber] || ''}
        onValueChange={(playerId) =>
          handleAddPlayerToMatch(
            matchIndex,
            teamNumber,
            playerId,
            playersPerGame,
            setActivePlayers,
            setSelectedPlayerDropdown,
          )
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select player to add" />
        </SelectTrigger>
        <SelectContent>
          {availablePlayers.map((player: any) => (
            <SelectItem key={player.id} value={player.id}>
              {player.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
