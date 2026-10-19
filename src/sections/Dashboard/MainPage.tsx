import { useEffect } from 'react';
import {
  DashboardBlockProgress,
  DashboardBlockSummary,
  DashboardSummaryCard,
} from './DashboardCards';
import {
  useCustomHook,
  UseHook
} from '../../utils/hooks';
import { getDashboardDataByLeagueId } from '../../utils/api/get';
import {
  Card,
  CardContent
} from '../../components/card';
import { Button } from '../../components/button';
import { DEFAULT_MATCHES_PER_WEEK } from '../../utils/constants/others';
import { RefreshCw } from 'lucide-react';

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

  const { selectedLeagueName } = UseHook();

  const totalBlocks = dashboardData?.total_blocks ?? 0;
  const matchesPerWeek =
    dashboardData?.average_matches_per_week || DEFAULT_MATCHES_PER_WEEK;
  const totalTeams = dashboardData?.total_teams ?? 0;
  const totalPlayers = dashboardData?.total_players ?? 0;
  const completionPercentage = dashboardData?.completion_percentage ?? 0;

  useEffect(() => {
    let isCurrent = true;

    const fetchData = async () => {
      setIsLoadingSkeleton(true);
      setDashboardData(null);
      setLoadingBlockCount(0);
      setDashboardLoadError(null);

      try {
        if (
          selectedLeague === null ||
          selectedLeague === undefined ||
          selectedLeague === ''
        ) {
          setDashboardData(null);
          setDashboardLoadError(null);
          setIsLoadingSkeleton(false);
          setLoadingBlockCount(0);
          return;
        }

        const data = await getDashboardDataByLeagueId(selectedLeague);

        if (!isCurrent) return;

        setLoadingBlockCount(data?.total_blocks ?? 0);
        setDashboardData(data);

        if (!data) setDashboardLoadError('Unable to load dashboard data.');
      } catch (err) {
        if (!isCurrent) return;

        setDashboardData(null);
        setDashboardLoadError(
          err instanceof Error ? err.message : 'Unable to load dashboard data.',
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
    setLoadingBlockCount,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of {selectedLeagueName || 'your bowling league'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={retryDashboard}
          disabled={isLoadingSkeleton}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoadingSkeleton ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {dashboardLoadError && (
        <Card className="border-destructive/40">
          <CardContent className="py-4">
            <p className="text-sm text-destructive" role="alert">
              Dashboard error: {dashboardLoadError}
            </p>
            <Button onClick={retryDashboard} disabled={isLoadingSkeleton}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!dashboardLoadError && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            <DashboardSummaryCard
              label="Match Completion"
              value={completionPercentage}
              suffix="%"
              isLoading={isLoadingSkeleton}
            />
          </div>

          {/* Block Progress Cards */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <DashboardBlockProgress
              totalBlocks={totalBlocks}
              dashboardData={dashboardData}
              matchesPerWeek={matchesPerWeek}
              isLoading={isLoadingSkeleton}
              loadingBlockCount={loadingBlockCount}
            />
          </div>

          {/* Block Summary Cards */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <DashboardBlockSummary
              totalBlocks={totalBlocks}
              dashboardData={dashboardData}
              matchesPerWeek={matchesPerWeek}
              isLoading={isLoadingSkeleton}
              loadingBlockCount={loadingBlockCount}
            />
          </div>
        </>
      )}
    </div>
  );
}
