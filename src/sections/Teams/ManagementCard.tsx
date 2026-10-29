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
}

export default function ManagementCard({
  newTeamName,
  setNewTeamName,
  creatingTeam,
  onCreateTeam,
  onOpenBulkCreate,
  existingTeams,
}: ManagementCardProps) {
  const normalizedNewTeamName = newTeamName.trim().toLocaleLowerCase();
  const duplicateTeam = normalizedNewTeamName
    ? existingTeams.some(
      (team) =>
        team.name.trim().toLocaleLowerCase() === normalizedNewTeamName,
    )
    : false;

  return (
    <Card className="mx-auto w-full overflow-hidden rounded-xl border border-violet-800/90 bg-gradient-to-br from-[#11131f] to-[#0e101b] text-slate-100 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Plus className="h-5 w-5 text-violet-400" />
          Team management
        </CardTitle>
        <CardDescription className="text-slate-400">
          Create a new team or add multiple teams.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <section aria-label="Create a team" className="space-y-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!duplicateTeam && newTeamName.trim() && !creatingTeam) {
                onCreateTeam();
              }
            }}
            className="space-y-3"
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

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="submit"
                disabled={creatingTeam || !newTeamName.trim() || duplicateTeam}
                className="h-10 w-full gap-2 bg-violet-700 text-white hover:bg-violet-600"
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
                disabled={creatingTeam}
                className="h-10 w-full gap-2 border-slate-700 bg-[#0b0c14] text-slate-100 hover:bg-slate-800"
              >
                <ListPlus className="h-4 w-4 shrink-0" />
                Bulk Add
              </Button>
            </div>
          </form>

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
      </CardContent>
    </Card>
  );
}
