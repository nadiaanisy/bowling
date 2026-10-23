import HistoryEntry from './HistoryEntry';
import { getHandicapChangeHistory } from '../../utils/api/get';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Button } from '../../components/button';
import {
  History,
  RefreshCw
} from 'lucide-react';

type HistoryRow = Awaited<ReturnType<typeof getHandicapChangeHistory>>[number];

interface HandicapHistoryPanelProps {
  leagueId: string | number | null;
  loading: boolean;
  error: string;
  rows: HistoryRow[];
  onRefresh: () => void;
}

/** Displays the history panel; data fetching and race protection stay in the parent. */
export function HandicapHistoryPanel({
  leagueId,
  loading,
  error,
  rows,
  onRefresh,
}: HandicapHistoryPanelProps) {
  return (
    <Card className="flex min-h-0 min-w-0 flex-col">
      <CardHeader className="shrink-0 space-y-2 p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 shrink-0" />
              Hdc - History
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Recent handicap and maximum-setting changes.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading || leagueId === null}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span className="sr-only">Refresh history</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-col px-4 pb-4 pt-0">
        {leagueId === null ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Select a league to view its change history.
          </p>
        ) : loading ? (
          <p
            className="py-4 text-center text-xs text-muted-foreground"
            role="status"
          >
            Loading change history…
          </p>
        ) : error ? (
          <div
            className="rounded-md border border-destructive/30 p-4 text-sm text-destructive"
            role="alert"
          >
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRefresh}
            >
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No changes have been recorded for this league yet.
          </p>
        ) : (
          <div className="h-[50vh] min-h-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {rows.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Showing the latest {rows.length} change
              {rows.length === 1 ? '' : 's'}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
