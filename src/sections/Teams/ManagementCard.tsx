import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import {
Loader2,
Plus,
ListPlus,
CircleAlert
} from 'lucide-react';

interface ManagementCardProps {
  newTeamName: string;
  setNewTeamName: (value: string) => void;
  creatingTeam: boolean;
  onCreateTeam: () => void;
  onOpenBulkCreate: () => void;
  existingTeams: Array<{ name: string }>;
  registeredTeamsCount: number;
  maxTeams: number | null;
}

export default function ManagementCard({
  newTeamName,
  setNewTeamName,
  creatingTeam,
  onCreateTeam,
  onOpenBulkCreate,
  existingTeams,
  registeredTeamsCount,
  maxTeams,
}: ManagementCardProps) {
  const normalizedNewTeamName = newTeamName.trim().toLocaleLowerCase();
  const duplicateTeam = normalizedNewTeamName
    ? existingTeams.some(
        (team) =>
          team.name.trim().toLocaleLowerCase() === normalizedNewTeamName,
      )
    : false;

  const teamLimitReached =
    maxTeams !== null && registeredTeamsCount >= maxTeams;

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Team management</CardTitle>
        <CardDescription>
          Create a registered team for this league.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <section aria-label="Create a team" className="space-y-3">
          <div className="flex flex-col gap-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  !duplicateTeam &&
                  newTeamName.trim() &&
                  !creatingTeam &&
                  !teamLimitReached
                ) {
                  onCreateTeam();
                }
              }}
              className="flex min-w-0 flex-col gap-2"
            >
              <Input
                aria-label="New team name"
                placeholder="Enter a new team name..."
                value={newTeamName}
                onChange={(event) => setNewTeamName(event.target.value)}
                disabled={creatingTeam}
                aria-invalid={duplicateTeam}
                className={
                  duplicateTeam
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={
                    creatingTeam ||
                    !newTeamName.trim() ||
                    duplicateTeam ||
                    teamLimitReached
                  }
                  className="gap-2 sm:min-w-[118px]"
                >
                  {creatingTeam ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {creatingTeam ? 'Adding...' : 'Add Team'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenBulkCreate}
                  disabled={creatingTeam || teamLimitReached}
                  className="gap-2 sm:min-w-[120px]"
                >
                  <ListPlus className="h-4 w-4" />
                  Bulk Add
                </Button>
              </div>
            </form>
          </div>

          {duplicateTeam && (
            <p
              className="flex items-start gap-2 text-sm text-destructive"
              role="alert"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>A team with this name already exists in this league.</span>
            </p>
          )}
        </section>

        <p className="rounded-lg border border-violet-300/10 bg-violet-500/[0.06] px-3 py-2 text-xs text-slate-400">
          {maxTeams === null
            ? `${registeredTeamsCount} teams registered. No team limit is set in League Setup.`
            : `${Math.max(0, maxTeams - registeredTeamsCount)} team slots remaining (${registeredTeamsCount} of ${maxTeams} registered).`}
        </p>
        {teamLimitReached && (
          <p className="text-xs text-amber-300" role="status">
            The league’s registered team limit has been reached.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
