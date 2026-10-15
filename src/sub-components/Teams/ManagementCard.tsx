import { Loader2, Search, X, Plus, ListPlus, CircleAlert } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Button } from '../../components/button';

interface ManagementCardProps {
  newTeamName: string;
  setNewTeamName: (value: string) => void;
  creatingTeam: boolean;
  onCreateTeam: () => void;
  onOpenBulkCreate: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredTeamsCount: number;
  existingTeams: Array<{ name: string }>;
}

export default function ManagementCard({
  newTeamName,
  setNewTeamName,
  creatingTeam,
  onCreateTeam,
  onOpenBulkCreate,
  searchQuery,
  setSearchQuery,
  filteredTeamsCount,
  existingTeams,
}: ManagementCardProps) {
  const normalizedNewTeamName = newTeamName.trim().toLocaleLowerCase();
  const duplicateTeam = normalizedNewTeamName
    ? existingTeams.some(
        (team) =>
          team.name.trim().toLocaleLowerCase() === normalizedNewTeamName,
      )
    : false;

  // BLIND is a scoring placeholder, not a registered team, so exclude it from the count.
  const hasBlindPlaceholder = existingTeams.some(
    (team) => team.name.trim().toLocaleLowerCase() === 'blind',
  );
  const searchMatchesBlind = 'blind'.includes(
    searchQuery.trim().toLocaleLowerCase(),
  );
  const displayedTeamsCount = Math.max(
    0,
    filteredTeamsCount -
      (hasBlindPlaceholder && (!searchQuery.trim() || searchMatchesBlind)
        ? 1
        : 0),
  );

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Team management</CardTitle>
        <CardDescription>
          Create a team or search your existing teams and players.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <section aria-label="Create a team" className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!duplicateTeam && newTeamName.trim() && !creatingTeam) {
                  onCreateTeam();
                }
              }}
              className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
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
              <Button
                type="submit"
                disabled={creatingTeam || !newTeamName.trim() || duplicateTeam}
                className="shrink-0 gap-2 sm:min-w-[118px]"
              >
                {creatingTeam ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {creatingTeam ? 'Adding...' : 'Add Team'}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenBulkCreate}
              disabled={creatingTeam}
              className="shrink-0 gap-2 sm:min-w-[120px]"
            >
              <ListPlus className="h-4 w-4" />
              Bulk Add
            </Button>
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

        <div className="border-t border-border/70" />

        <section aria-label="Find teams and players" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Your teams</h3>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {displayedTeamsCount}{' '}
              {displayedTeamsCount === 1 ? 'team' : 'teams'}
            </span>
          </div>

          <div className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search teams or players..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Search teams or players"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear team search"
                onClick={() => setSearchQuery('')}
                className="flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
