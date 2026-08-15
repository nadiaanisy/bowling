import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  getBlockCountByLeague,
  getDashboardDataByLeagueId
} from '../utils/api/get';
import {
  Card,
  CardContent
} from '../components/card';
import {
  DashboardBlockProgress,
  DashboardBlockSummary,
  DashboardSummaryCard
} from '../sub-components/DashboardCards';
import { Button } from '../components/button';
import { useCustomHook } from '../utils/hooks';

const DEFAULT_MATCHES_PER_WEEK = 16;

export default function Dashboard() {
  const {
    isLoadingSkeleton,
    dashboardData,
    setIsLoadingSkeleton,
    setDashboardData,
    selectedLeague,
    loadingBlockCount,
    setLoadingBlockCount,
    dashboardLoadError,
    setDashboardLoadError,
    dashboardReloadKey,
    retryDashboard,
  } = useCustomHook();

  const totalBlocks = dashboardData?.total_blocks ?? 0;
  const matchesPerWeek = dashboardData?.average_matches_per_week || DEFAULT_MATCHES_PER_WEEK;
  const totalTeams = dashboardData?.total_teams ?? 0;
  const totalPlayers = dashboardData?.total_players ?? 0;

  useEffect(() => {
    let isCurrent = true;

    const fetchData = async () => {
      setIsLoadingSkeleton(true);
      setDashboardData(null);
      setLoadingBlockCount(0);
      setDashboardLoadError(null);

      try {
        const [blockCount, data] = await Promise.all([
          getBlockCountByLeague(selectedLeague),
          getDashboardDataByLeagueId(selectedLeague)
        ]);

        if (!isCurrent) return;

        setLoadingBlockCount(blockCount);
        setDashboardData(data);
        if (!data) setDashboardLoadError('Unable to load dashboard data.');
      } catch (err) {
        if (!isCurrent) return;

        setDashboardData(null);
        setDashboardLoadError(
          err instanceof Error ? err.message : 'Unable to load dashboard data.'
        );
      } finally {
        if (isCurrent) setIsLoadingSkeleton(false);
      }
    };

    void fetchData();

    return () => {
      isCurrent = false;
    };
  }, [
    selectedLeague,
    dashboardReloadKey,
    setDashboardData,
    setDashboardLoadError,
    setIsLoadingSkeleton,
    setLoadingBlockCount
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bowling league</p>
      </div>

      {dashboardLoadError && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-destructive" role="alert">{dashboardLoadError}</p>
            <Button
              variant="outline"
              onClick={retryDashboard}
              disabled={isLoadingSkeleton}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoadingSkeleton ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardSummaryCard
          label="Total Teams"
          value={totalTeams}
          isLoading={isLoadingSkeleton}
        />
        <DashboardSummaryCard
          label="Total Players"
          value={totalPlayers}
          isLoading={isLoadingSkeleton}
        />
        <DashboardBlockProgress
          totalBlocks={totalBlocks}
          dashboardData={dashboardData}
          matchesPerWeek={matchesPerWeek}
          isLoading={isLoadingSkeleton}
          loadingBlockCount={loadingBlockCount}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-5">
        <DashboardBlockSummary
          totalBlocks={totalBlocks}
          dashboardData={dashboardData}
          matchesPerWeek={matchesPerWeek}
          isLoading={isLoadingSkeleton}
          loadingBlockCount={loadingBlockCount}
        />
      </div>
    </div>
  );
}
