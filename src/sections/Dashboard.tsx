import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/card';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useCustomHook } from '../utils/hooks';
import { Skeleton } from '../components/skeleton';
import {
  getBlockCountByLeague,
  getDashboardDataByLeagueId
} from '../utils/api/get';

const DEFAULT_MATCHES_PER_WEEK = 16;

const getWeeksRemaining = (pending: number, matchesPerWeek: number) =>
  pending > 0 ? Math.ceil(pending / matchesPerWeek) : 0;

export default function Dashboard() {
  const {
    isLoadingSkeleton,
    dashboardData,
    setIsLoadingSkeleton,
    setDashboardData,
    selectedLeague,
  } = useCustomHook();
  const totalBlocks = dashboardData?.total_blocks ?? 0;
  const [loadingBlockCount, setLoadingBlockCount] = useState(0);
  const matchesPerWeek = dashboardData?.average_matches_per_week || DEFAULT_MATCHES_PER_WEEK;
  const totalTeams = dashboardData?.total_teams ?? 0;
  const totalPlayers = dashboardData?.total_players ?? 0;

  useEffect(() => {
    let isCurrent = true;

    const fetchData = async () => {
      setIsLoadingSkeleton(true);
      setDashboardData(null);
      setLoadingBlockCount(0);
      try {
        const blockCountPromise = getBlockCountByLeague(selectedLeague);
        blockCountPromise.then((blockCount) => {
          if (isCurrent) setLoadingBlockCount(blockCount);
        });

        const data = await getDashboardDataByLeagueId(selectedLeague);

        if (isCurrent) {
          setDashboardData(data);
        }
      } catch {
        if (isCurrent) setDashboardData(null);
      } finally {
        if (isCurrent) setIsLoadingSkeleton(false);
      }
    };

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [selectedLeague, setDashboardData, setIsLoadingSkeleton]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bowling league</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Teams */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.25 }}
        >
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Teams</CardDescription>
            <CardTitle className="text-4xl">
              {isLoadingSkeleton ? (
                <Skeleton className="h-10 w-10" />
              ) : (
                <div className="space-y-1">
                  <div>{totalTeams}</div>
                  {totalTeams === 0 && (
                    <p className="text-xs font-normal text-muted-foreground">
                      No data
                    </p>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        </motion.div>

        {/* Total Players */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            <CardTitle className="text-4xl">
              {isLoadingSkeleton ? (
                <Skeleton className="h-10 w-10" />
              ) : (
                <div className="space-y-1">
                  <div>{totalPlayers}</div>
                  {totalPlayers === 0 && (
                    <p className="text-xs font-normal text-muted-foreground">
                      No data
                    </p>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        </motion.div>

        {isLoadingSkeleton ? (
          <>
            {Array.from({ length: loadingBlockCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
              >
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardDescription>Block {index + 1} Progress</CardDescription>
                  <Skeleton className="h-10 w-28" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </>
        ) : totalBlocks > 0 && (
          <div className="contents">
            {Array.from({ length: totalBlocks }).map((_, index) => {
              const block = dashboardData?.blocks?.[`block${index + 1}`];
              const total = block?.total ?? 0;
              const completed = block?.completed ?? 0;
              const avgPerWeek = matchesPerWeek;

              const totalWeeks = total > 0 ? Math.ceil(total / avgPerWeek) : 0;
              const completedWeeks = total > 0 ? Math.floor(completed / avgPerWeek) : 0;
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
                >
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardDescription>Block {index + 1} Progress</CardDescription>
                    <CardTitle className="text-4xl">
                      {`${completedWeeks}/${totalWeeks} weeks`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">{status}</div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-5">
        {isLoadingSkeleton
          ? Array.from({ length: loadingBlockCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
            >
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))
          : Array.from({ length: totalBlocks }).map(
          (_, index) => {
            const blockKey = `block${index + 1}`;
            const blockData = dashboardData?.blocks?.[blockKey];

            const total = blockData?.total ?? 0;
            const completed = blockData?.completed ?? 0;
            const pending = blockData?.pending ?? 0;

            const weeksRemaining = getWeeksRemaining(pending, matchesPerWeek);
            const weekLabel = weeksRemaining === 1 ? "week" : "weeks";

            return (
              <motion.div
                key={blockKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
              >
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
              </motion.div>
            );
          }
        )}
      </div>
    </div>
  );
}
