import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import { useHandicap } from '../../functions/handicap';
import { Save } from 'lucide-react';

interface MaximumHandicapProps {
  leagueId: string | number | null;
}

export function MaximumHandicap({ leagueId }: MaximumHandicapProps) {
  const handicap = useHandicap(leagueId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maximum Handicap</CardTitle>
        <CardDescription>
          Set the maximum handicap applied to each gender in this league.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handicap.handleSaveConfig} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="men-max-handicap">Men's maximum handicap</Label>
              <Input
                id="men-max-handicap"
                type="number"
                min="0"
                step="1"
                value={handicap.menMaxHandicap}
                onChange={(event) =>
                  handicap.setMenMaxHandicap(event.target.value)
                }
                disabled={handicap.isSavingConfig || leagueId === null}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="women-max-handicap">
                Women's maximum handicap
              </Label>
              <Input
                id="women-max-handicap"
                type="number"
                min="0"
                step="1"
                value={handicap.womenMaxHandicap}
                onChange={(event) =>
                  handicap.setWomenMaxHandicap(event.target.value)
                }
                disabled={handicap.isSavingConfig || leagueId === null}
                required
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={handicap.isSavingConfig || leagueId === null}
            >
              <Save className="mr-2 h-4 w-4" />
              {handicap.isSavingConfig ? 'Saving...' : 'Save Maximums'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
