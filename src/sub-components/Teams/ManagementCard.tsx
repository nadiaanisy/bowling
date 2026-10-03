import { Loader2, Search, X } from 'lucide-react';
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
}: ManagementCardProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Team management</CardTitle>

        <CardDescription>
          Add a team or find an existing team and player.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onCreateTeam();
            }}
            className="flex min-w-0 flex-1 gap-2"
          >
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(event) => setNewTeamName(event.target.value)}
              disabled={creatingTeam}
            />

            <Button
              type="submit"
              disabled={creatingTeam || !newTeamName.trim()}
              className="gap-2"
            >
              {creatingTeam && <Loader2 className="h-4 w-4 animate-spin" />}

              {creatingTeam ? 'Adding...' : 'Add Team'}
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={onOpenBulkCreate}
            disabled={creatingTeam}
          >
            Add Teams
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search teams or players..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />

          {searchQuery && (
            <button
              type="button"
              aria-label="Clear team search"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {filteredTeamsCount} {filteredTeamsCount === 1 ? 'team' : 'teams'}
        </p>
      </CardContent>
    </Card>
  );
}
