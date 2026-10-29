import type React from 'react';
import { Cards } from './Cards';
import {
  Card,
  CardContent,
  CardHeader
} from '../../components/card';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';

interface GridProps {
  teams: React.ComponentProps<typeof Cards>['teams'];
  filteredTeams: React.ComponentProps<typeof Cards>['teams'];
  isLoadingTeams: boolean;
  teamsLoadError?: string | null;
  retryTeams: () => void;
  teamCardProps: Omit<React.ComponentProps<typeof Cards>, 'team'>;
  currentPage: number;
  totalPages: number;
  totalFilteredTeams: number;
  onPageChange: (page: number) => void;
}

export default function Grid({
  teams,
  filteredTeams,
  isLoadingTeams,
  teamsLoadError,
  retryTeams,
  teamCardProps,
  currentPage,
  totalPages,
  totalFilteredTeams,
  onPageChange,
}: GridProps) {
  if (teamsLoadError) {
    return (
      <Card className="mx-auto w-full border-destructive/40 bg-[#11131f] text-slate-100">
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
      <div className="mx-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="min-w-0">
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
      <Card className="mx-auto w-full border-violet-900/70 bg-[#11131f] text-slate-100">
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
      <Card className="mx-auto w-full border-violet-900/70 bg-[#11131f] text-slate-100">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No teams match your search query.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <span>
          Showing {(currentPage - 1) * 16 + 1}–
          {Math.min(currentPage * 16, totalFilteredTeams)} of{' '}
          {totalFilteredTeams} teams
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="min-w-[5rem] text-center text-xs text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <div className="mx-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTeams.map((team) => (
          <div key={team.id} className="min-w-0">
            <Cards {...teamCardProps} team={team} />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-2 text-xs text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
