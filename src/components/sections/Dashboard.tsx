import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { useEffect } from 'react';
import { useCustomHook } from '../misc';
import { Skeleton } from '../ui/skeleton';
import { getDashboardDataByLeagueId } from '../api/get';

export default function Dashboard() {
  const {
    isLoadingSkeleton,
    dashboardData,
    setIsLoadingSkeleton,
    setDashboardData,
    selectedLeague
  } = useCustomHook();

  useEffect(() => {
    // Fetch dashboard data when the component mounts
    const fetchData = async () => {
      setIsLoadingSkeleton(true);
      const data = await getDashboardDataByLeagueId(selectedLeague);
      setDashboardData(data);
      setIsLoadingSkeleton(false);
    };

    fetchData();
  }, [setDashboardData,setIsLoadingSkeleton]);
  return (
    <div className="p-4">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bowling league</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-5">
        {/* Total Teams */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Teams</CardDescription>
            <CardTitle className="text-4xl">
              {isLoadingSkeleton ? (
                <Skeleton className="h-10 w-10" />
              ) : (
                dashboardData?.total_teams
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Total Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            <CardTitle className="text-4xl">
              {isLoadingSkeleton ? (
                <Skeleton className="h-10 w-10" />
              ) : (
                dashboardData?.total_players
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-5">
        {Array.from({ length: dashboardData?.total_blocks || 0 }).map((_, index) => {
          const block = dashboardData?.blocks?.[`block${index + 1}`];
          const matchesPerWeek = 16;

          const total = block?.total ?? 0;
          const completed = block?.completed ?? 0;

          const totalWeeks = total > 0 ? Math.ceil(total / matchesPerWeek) : 0;
          const completedWeeks = total > 0 ? Math.floor(completed / matchesPerWeek) : 0;
          const weeksLeft = Math.max(totalWeeks - completedWeeks, 0);

          const status =
            totalWeeks === 0
              ? "No data"
              : completedWeeks >= totalWeeks
              ? "Completed"
              : weeksLeft === 0
              ? "No weeks remaining"
              : `${weeksLeft} weeks remaining`;

          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardDescription>Block {index + 1} Progress</CardDescription>
                <CardTitle className="text-4xl">
                  {isNaN(completedWeeks) || isNaN(totalWeeks)
                    ? "0/0 weeks"
                    : `${completedWeeks}/${totalWeeks} weeks`}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground">{status}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-5">
        {Array.from({ length: dashboardData?.total_blocks || 0 }).map((_, index) => {
          const blockKey = `block${index + 1}`;
          const blockData = dashboardData?.blocks?.[blockKey];

          // Configure how many matches correspond to a week
          const matchesPerWeek = 16;

          // Safe values
          const total = blockData?.total ?? 0;
          const completed = blockData?.completed ?? 0;
          const pending = blockData?.pending ?? 0;

          // Calculate weeks remaining (round up)
          const weeksRemaining = pending > 0 ? Math.ceil(pending / matchesPerWeek) : 0;
          const weekLabel = weeksRemaining === 1 ? "week" : "weeks";

          return (
            <Card key={blockKey}>
              <CardHeader>
                <CardTitle>Block {index + 1}</CardTitle>
                <CardDescription>
                  {total ? `Total ${total} matches` : "No matches found"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Matches Scheduled:</span>
                    <span className="text-sm">{total}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Matches Completed:</span>
                    <span className="text-sm">{completed}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Matches Pending:</span>
                    <span className="text-sm">{pending}</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {total === 0
                      ? "No schedule"
                      : completed >= total
                      ? "Completed"
                      : `${weeksRemaining} ${weekLabel} remaining`}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
