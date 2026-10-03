import type React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/card';
import { Cards } from './Cards';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import { setAllTeamsExpanded } from '../../utils/functions/teams';

interface GridProps {
  teams: React.ComponentProps<typeof Cards>['teams'];
  filteredTeams: React.ComponentProps<typeof Cards>['teams'];
  isLoadingTeams: boolean;
  teamsLoadError?: string | null;
  retryTeams: () => void;
  expandedTeams: React.ComponentProps<typeof Cards>['expandedTeams'];
  setExpandedTeams: React.ComponentProps<typeof Cards>['setExpandedTeams'];
  teamCardProps: Omit<React.ComponentProps<typeof Cards>, 'team'>;
  canExpandAll: boolean;
  canCollapseAll: boolean;
}

export default function Grid({
  teams,
  filteredTeams,
  isLoadingTeams,
  teamsLoadError,
  retryTeams,
  expandedTeams,
  setExpandedTeams,
  teamCardProps,
  canExpandAll,
  canCollapseAll,
}: GridProps) {
  if (teamsLoadError) {
    return (
      <Card className="mx-auto w-full max-w-3xl border-destructive/40">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-sm text-destructive" role="alert">
            {teamsLoadError}
          </p>

          <Button
            variant="outline"
            onClick={retryTeams}
            disabled={isLoadingTeams}
          >
            {isLoadingTeams ? 'Retrying...' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingTeams) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]"
          >
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>

              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No teams yet. Add your first team above.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No teams match your search query.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!canExpandAll}
          onClick={() =>
            setAllTeamsExpanded(filteredTeams, true, setExpandedTeams)
          }
        >
          <Maximize2 className="h-4 w-4" />
          Expand all
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!canCollapseAll}
          onClick={() =>
            setAllTeamsExpanded(filteredTeams, false, setExpandedTeams)
          }
        >
          <Minimize2 className="h-4 w-4" />
          Collapse all
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]"
          >
            <Cards {...teamCardProps} team={team} />
          </div>
        ))}
      </div>
    </>
  );
}
