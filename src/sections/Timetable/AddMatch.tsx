import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import type { LeagueTeam } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { changeMatchWeek } from '../../functions/timetable';
import { handleAddMatch } from '../../functions/timetable';
import { resetMatchForm } from '../../functions/timetable';
import { TIMETABLE_SCHEDULE_TYPES } from '../../utils/constants/timetable';

type BlockData = {
  id: string | number;
  number: number;
};

type LaneData = {
  id: string | number;
  lane: string;
};

type ScheduleSettings = {
  leagueDay: string;
  commencementDate: string;
  practiceTime: string;
  gameStartTime: string;
  lateCutoff: string;
  gamesPerWeek: string | number | null;
  playersPerGame: string | number | null;
  openBowlersPerWeek: string | null;
  postponementLimit: string | null;
  postponementNoticeDay: string;
  allowPreBowl: boolean;
  allowPostBowl: boolean;
  blockPostBowlFinal: boolean;
  noHolidaySessions: boolean;
};

interface AddMatchProps {
  selectedLeague: string | null;
  maxWeeksPerBlock: number | null;
  scheduleSettings: ScheduleSettings;
  blocksData: BlockData[];
  blockNumber: number | null;
  setBlockNumber: (value: number | null) => void;
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
  scheduledDate: string;
  setScheduledDate: (value: string) => void;
  scheduleType: 'regular' | 'pre_bowl' | 'post_bowl';
  setScheduleType: (value: 'regular' | 'pre_bowl' | 'post_bowl') => void;
  selectedLane: string;
  setSelectedLane: (value: string) => void;
  creatingMatch: boolean;
  setCreatingMatch: (value: boolean) => void;
  retryTimetable: () => Promise<void>;
}

export function AddMatch({
  selectedLeague,
  maxWeeksPerBlock,
  scheduleSettings,
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
  scheduledDate,
  setScheduledDate,
  scheduleType,
  setScheduleType,
  selectedLane,
  setSelectedLane,
  creatingMatch,
  setCreatingMatch,
  retryTimetable,
}: AddMatchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Match to Schedule</CardTitle>

        <CardDescription>
          Manually assign weekly matchups using this league’s setup.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-5 rounded-lg border border-violet-300/15 bg-violet-500/[0.06] p-3 text-sm">
          <p className="font-medium text-slate-100">Schedule settings</p>
          <div className="mt-2 grid gap-x-4 gap-y-1 text-xs text-slate-400 sm:grid-cols-2 xl:grid-cols-3">
            <span>League day: {scheduleSettings.leagueDay || 'Not set'}</span>
            <span>
              First session: {scheduleSettings.commencementDate || 'Not set'}
            </span>
            <span>Practice: {scheduleSettings.practiceTime || 'Not set'}</span>
            <span>
              Game start: {scheduleSettings.gameStartTime || 'Not set'}
            </span>
            <span>Late cutoff: {scheduleSettings.lateCutoff || 'Not set'}</span>
            <span>
              Games per week: {scheduleSettings.gamesPerWeek ?? 'Not set'}
            </span>
            <span>
              Players per game: {scheduleSettings.playersPerGame ?? 'Not set'}
            </span>
            <span>
              Open bowlers per week:{' '}
              {scheduleSettings.openBowlersPerWeek ?? 'Not set'}
            </span>
            <span>
              Postponement limit:{' '}
              {scheduleSettings.postponementLimit ?? 'Not set'}
            </span>
            <span>
              Postponement notice day:{' '}
              {scheduleSettings.postponementNoticeDay || 'Not set'}
            </span>
            <span>
              Pre-bowl:{' '}
              {scheduleSettings.allowPreBowl ? 'Allowed' : 'Not allowed'}
            </span>
            <span>
              Post-bowl:{' '}
              {scheduleSettings.allowPostBowl ? 'Allowed' : 'Not allowed'}
            </span>
            {scheduleSettings.blockPostBowlFinal && (
              <span>Post-bowl blocked in final week</span>
            )}
          </div>
          {scheduleSettings.noHolidaySessions && (
            <p className="mt-2 text-xs text-amber-200">
              League Setup says no sessions on public holidays. Check holidays
              and events when entering or editing session dates.
            </p>
          )}
          {timetableTeams.filter(
            (team) => team.name.trim().toLocaleLowerCase() !== 'blind',
          ).length %
            2 ===
            1 && (
            <p className="mt-2 text-xs text-sky-200">
              Odd number of teams: the Blind team is available automatically for
              scheduling and does not count as a registered team.
            </p>
          )}
        </div>
        <form
          onSubmit={(event) =>
            void handleAddMatch(
              event,
              creatingMatch,
              setCreatingMatch,
              selectedLeague,
              blockNumber || null,
              week,
              maxWeeksPerBlock,
              scheduledDate,
              scheduleType,
              team1,
              team2,
              selectedLane,
              () => {
                resetMatchForm(
                  setWeek,
                  setScheduledDate,
                  setScheduleType,
                  setTeam1,
                  setTeam2,
                  setSelectedLane,
                );
                void retryTimetable();
              },
            )
          }
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* BLOCK */}
            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>

              <Select
                value={blockNumber?.toString() ?? ''}
                onValueChange={(value) => setBlockNumber(Number(value))}
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
                max={maxWeeksPerBlock ?? undefined}
                step="1"
                placeholder={
                  maxWeeksPerBlock ? `1-${maxWeeksPerBlock}` : 'Week number'
                }
                value={week}
                onChange={(event) =>
                  changeMatchWeek(
                    event.target.value,
                    setWeek,
                    setTeam1,
                    setTeam2,
                    setSelectedLane,
                  )
                }
              />
            </div>

            {/* SESSION DATE: suggested by the league start date, editable for holidays/events */}
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Session Date</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Suggested from commencement date. Change it for holidays or
                events.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-type">Bowling arrangement</Label>
              <Select
                value={scheduleType}
                onValueChange={(value) =>
                  setScheduleType(value as typeof scheduleType)
                }
              >
                <SelectTrigger id="schedule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMETABLE_SCHEDULE_TYPES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={
                        option.value === 'pre_bowl'
                          ? !scheduleSettings.allowPreBowl
                          : option.value === 'post_bowl'
                            ? !scheduleSettings.allowPostBowl ||
                              (scheduleSettings.blockPostBowlFinal &&
                                Number(week) === maxWeeksPerBlock)
                            : false
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              onClick={() =>
                resetMatchForm(
                  setWeek,
                  setScheduledDate,
                  setScheduleType,
                  setTeam1,
                  setTeam2,
                  setSelectedLane,
                )
              }
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
