import { UseHook } from '../../utils/hooks';
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
  const { listOfLeaguesByUser } = UseHook();
  const selectedLeague = listOfLeaguesByUser.find(
    (league) => String(league.id) === String(leagueId),
  );
  const setup = selectedLeague?.setup_config ?? {};
  const enabled =
    setup.enable_handicap === true || setup.enable_handicap === 'true';
  const settingText = (value: unknown, suffix = '') =>
    value === null || value === undefined || value === ''
      ? 'Not configured'
      : `${String(value)}${suffix}`;
  const settingBoolean = (value: unknown) =>
    value === true || value === 'true' ? 'On' : 'Off';

  return (
    <Card className="border-violet-300/10 bg-[#15121c]">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Maximum Handicap</CardTitle>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              enabled
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-violet-300/15 bg-violet-500/10 text-violet-200'
            }`}
          >
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <CardDescription>
          Synced with Handicap settings in League Setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-violet-300/10 bg-white/[0.02] p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-200">
            League Setup · Handicap Rules
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Calculation</dt>
              <dd className="mt-0.5 font-medium">
                {settingText(setup.calculation_method)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Base average</dt>
              <dd className="mt-0.5 font-medium">
                {settingText(setup.base_average)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Percentage</dt>
              <dd className="mt-0.5 font-medium">
                {settingText(setup.handicap_percentage, '%')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Games to establish average
              </dt>
              <dd className="mt-0.5 font-medium">
                {settingText(setup.games_for_average)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Round to whole pin
              </dt>
              <dd className="mt-0.5 font-medium">
                {settingBoolean(setup.round_handicap)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Promoted bowlers
              </dt>
              <dd className="mt-0.5 font-medium">
                {settingBoolean(setup.promote_handicap)}
              </dd>
            </div>
          </dl>
        </div>
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
              {handicap.isSavingConfig ? 'Saving...' : 'Save to League Setup'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
