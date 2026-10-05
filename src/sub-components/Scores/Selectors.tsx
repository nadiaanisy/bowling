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
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { Label } from '../../components/label';
import {
  handleBlockChanged,
  handleWeekChanged,
} from '../../utils/functions/scores';

type ScoreSelectorsProps = {
  blockNumber: number | null;
  weekInScores: string;
  blocksData: any[];
  weeksAvailable: number[];
  setBlockNumber: any;
  setWeekInScores: any;
  setScores: any;
  setActivePlayers: any;
};

export default function ScoreSelectors({
  blockNumber,
  weekInScores,
  blocksData,
  weeksAvailable,
  setBlockNumber,
  setWeekInScores,
  setScores,
  setActivePlayers,
}: ScoreSelectorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Match</CardTitle>
        <CardDescription>
          Choose a block and week to input scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="block-select">Block</Label>
            <Select
              value={blockNumber?.toString() ?? ''}
              onValueChange={(v) =>
                handleBlockChanged(
                  Number(v),
                  setBlockNumber,
                  setWeekInScores,
                  setScores,
                  setActivePlayers,
                )
              }
            >
              <SelectTrigger id="select-block">
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

          <div className="space-y-2">
            <Label htmlFor="week">Week</Label>
            <Select
              value={weekInScores || ''}
              onValueChange={(val) =>
                handleWeekChanged(
                  val,
                  setWeekInScores,
                  setScores,
                  setActivePlayers,
                )
              }
              disabled={!blockNumber || weeksAvailable.length === 0}
            >
              <SelectTrigger id="week">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {weeksAvailable.length > 0 ? (
                  weeksAvailable.map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
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
  );
}
