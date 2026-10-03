import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import type { LeagueTeam } from '../../utils/interfaces';
import { handleAddMatch } from '../../utils/functions/timetable';

type BlockData = {
  id: string | number;
  number: number;
};

type LaneData = {
  id: string | number;
  lane: string;
};

interface AddMatchProps {
  selectedLeague: string | null;
  blocksData: BlockData[];
  blockNumber: number;
  setBlockNumber: (value: number) => void;
  timetableTeams: LeagueTeam[];
  lanes: LaneData[];
  usedTeams: string[];
  usedLanes: string[];
  team1: string;
  setTeam1: (value: string) => void;
  team2: string;
  setTeam2: (value: string) => void;
  week: string;
  setWeek: (value: string) => void;
  selectedLane: string;
  setSelectedLane: (value: string) => void;
  creatingMatch: boolean;
  setCreatingMatch: (value: boolean) => void;
  retryTimetable: () => Promise<void>;
}

export function AddMatch({
  selectedLeague,
  blocksData,
  blockNumber,
  setBlockNumber,
  timetableTeams,
  lanes,
  usedTeams,
  usedLanes,
  team1,
  setTeam1,
  team2,
  setTeam2,
  week,
  setWeek,
  selectedLane,
  setSelectedLane,
  creatingMatch,
  setCreatingMatch,
  retryTimetable,
}: AddMatchProps) {
  const resetForm = () => {
    setWeek('');
    setTeam1('');
    setTeam2('');
    setSelectedLane('');
  };

  const handleWeekChange = (value: string) => {
    setWeek(value);

    // Week changes invalidate
    // all dependent selections.
    setTeam1('');
    setTeam2('');
    setSelectedLane('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Match to Schedule</CardTitle>

        <CardDescription>Schedule a match between two teams</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(event) =>
            void handleAddMatch(
              event,
              creatingMatch,
              setCreatingMatch,
              selectedLeague,
              blockNumber || null,
              week,
              team1,
              team2,
              selectedLane,
              () => {
                resetForm();
                void retryTimetable();
              },
            )
          }
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* BLOCK */}
            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>

              <Select
                value={blockNumber.toString()}
                onValueChange={(value) => setBlockNumber(parseInt(value))}
              >
                <SelectTrigger id="block">
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>

                <SelectContent>
                  {blocksData.map((block) => (
                    <SelectItem key={block.id} value={block.id.toString()}>
                      Block {block.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* WEEK */}
            <div className="space-y-2">
              <Label htmlFor="week">Week Number</Label>

              <Input
                id="week"
                type="number"
                min="1"
                max="100"
                placeholder="1-100"
                value={week}
                onChange={(event) => handleWeekChange(event.target.value)}
              />
            </div>

            {/* TEAM 1 */}
            <div className="space-y-2">
              <Label htmlFor="team1">Team 1</Label>

              <Select
                value={team1}
                onValueChange={(value) => {
                  if (usedTeams.includes(value)) {
                    return;
                  }

                  if (value === team2) {
                    return;
                  }

                  setTeam1(value);
                }}
                disabled={!week}
              >
                <SelectTrigger id="team1">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>

                <SelectContent>
                  {timetableTeams.map((team) => {
                    const teamId = team.id.toString();

                    const isUsed = usedTeams.includes(teamId);
                    const isTeam2 = teamId === team2;

                    return (
                      <SelectItem
                        key={team.id}
                        value={teamId}
                        className={isUsed || isTeam2 ? 'opacity-50' : undefined}
                      >
                        {team.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* TEAM 2 */}
            <div className="space-y-2">
              <Label htmlFor="team2">Team 2</Label>

              <Select
                value={team2}
                onValueChange={(value) => {
                  if (usedTeams.includes(value)) {
                    return;
                  }

                  if (value === team1) {
                    return;
                  }

                  setTeam2(value);
                }}
                disabled={!week || !team1}
              >
                <SelectTrigger id="team2">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>

                <SelectContent>
                  {timetableTeams.map((team) => {
                    const teamId = team.id.toString();

                    const isUsed = usedTeams.includes(teamId);
                    const isTeam1 = teamId === team1;

                    return (
                      <SelectItem
                        key={team.id}
                        value={teamId}
                        className={isUsed || isTeam1 ? 'opacity-50' : undefined}
                      >
                        {team.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* LANE */}
            <div className="space-y-2">
              <Label htmlFor="lane">Lane</Label>

              <Select
                value={selectedLane}
                onValueChange={setSelectedLane}
                disabled={!week || !team1 || !team2}
              >
                <SelectTrigger id="lane">
                  <SelectValue placeholder="Select lane" />
                </SelectTrigger>

                <SelectContent>
                  {lanes.map((lane) => (
                    <SelectItem
                      key={lane.id}
                      value={lane.id.toString()}
                      disabled={usedLanes.includes(lane.id.toString())}
                    >
                      {lane.lane}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={
                creatingMatch || (!week && !team1 && !team2 && !selectedLane)
              }
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={
                creatingMatch || !week || !team1 || !team2 || !selectedLane
              }
            >
              {creatingMatch ? 'Adding...' : 'Add Match'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
