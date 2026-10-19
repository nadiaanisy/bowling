import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import type {
  BlockWeekCalculation,
  DashboardData,
} from '../../utils/interfaces';
import { Skeleton } from '../../components/skeleton';
import { motion } from 'motion/react';

interface SummaryCardProps {
  label: string;
  value: number;
  isLoading: boolean;
  suffix?: string;
}

interface BlockCardsProps {
  totalBlocks: number;
  dashboardData: DashboardData | null;
  matchesPerWeek: number;
  isLoading: boolean;
  loadingBlockCount: number;
}

const calculateBlockWeeks = (
  totalMatches: number,
  matchesPerWeek: number,
): BlockWeekCalculation => ({
  totalWeeks:
    totalMatches > 0 && matchesPerWeek > 0
      ? Math.ceil(totalMatches / matchesPerWeek)
      : 0,
});

export function DashboardSummaryCard({
  label,
  value,
  isLoading,
  suffix = '',
}: SummaryCardProps) {
  return (
    <motion.div
      // key={`progress-${index}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-4xl">
            {isLoading ? (
              <Skeleton className="h-10 w-10" />
            ) : (
              <div className="space-y-1">
                <div>
                  {value}
                  {suffix}
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-sm text-muted-foreground">
            {value === 0 && (
              <p className="text-xs font-normal text-muted-foreground">
                No data
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardBlockProgress({
  totalBlocks,
  dashboardData,
  matchesPerWeek,
  isLoading,
  loadingBlockCount,
}: BlockCardsProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: loadingBlockCount }).map((_, index) => (
          <motion.div
            key={`progress-loading-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
          >
            <Card>
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
    );
  }

  return (
    <div className="contents">
      {Array.from({ length: totalBlocks }).map((_, index) => {
        const block = dashboardData?.blocks?.[index + 1];

        const total = block?.total ?? 0;
        const completed = block?.completed ?? 0;

        const { totalWeeks } = calculateBlockWeeks(total, matchesPerWeek);

        const completedWeeks =
          total > 0 && matchesPerWeek > 0
            ? Math.floor(completed / matchesPerWeek)
            : 0;

        const weeksLeft = Math.max(totalWeeks - completedWeeks, 0);

        const status =
          total === 0
            ? 'No matches scheduled yet'
            : completedWeeks >= totalWeeks
              ? 'Completed'
              : `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'} remaining`;

        return (
          <motion.div
            key={`progress-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08 + 0.15,
              duration: 0.25,
            }}
          >
            <Card>
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
  );
}

export function DashboardBlockSummary({
  totalBlocks,
  dashboardData,
  matchesPerWeek,
  isLoading,
  loadingBlockCount,
}: BlockCardsProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: loadingBlockCount }).map((_, index) => (
          <motion.div
            key={`summary-loading-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
          >
            <Card>
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
        ))}
      </>
    );
  }

  if (totalBlocks === 0) {
    return (
      <Card className="md:col-span-2">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="font-medium">No blocks configured yet</p>
          <p className="text-sm text-muted-foreground">
            Set up blocks for this league to start tracking match progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {Array.from({ length: totalBlocks }).map((_, index) => {
        const blockData = dashboardData?.blocks?.[index + 1];
        const total = blockData?.total ?? 0;
        const completed = blockData?.completed ?? 0;
        const pending = blockData?.pending ?? 0;

        // Calculate how many weeks this block occupies
        const { totalWeeks: blockWeeks } = calculateBlockWeeks(
          total,
          matchesPerWeek,
        );

        // Calculate the number of weeks occupied by previous blocks
        let previousWeeks = 0;

        for (let i = 0; i < index; i++) {
          const previousBlock = dashboardData?.blocks?.[i + 1];

          const previousTotal = previousBlock?.total ?? 0;

          if (previousTotal > 0 && matchesPerWeek > 0) {
            previousWeeks += calculateBlockWeeks(
              previousTotal,
              matchesPerWeek,
            ).totalWeeks;
          }
        }

        const startWeek = blockWeeks > 0 ? previousWeeks + 1 : 0;

        const endWeek = blockWeeks > 0 ? previousWeeks + blockWeeks : 0;

        const weekRange =
          blockWeeks > 0
            ? `Weeks ${startWeek}-${endWeek}`
            : 'No weeks scheduled';

        return (
          <motion.div
            key={`summary-${index + 1}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Block {index + 1}</CardTitle>
                <CardDescription>
                  {total > 0 ? weekRange : 'No matches scheduled yet'}
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
                </div>

                {total === 0 && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300">
                    <span className="font-semibold">ℹ</span>
                    <p>
                      No matches scheduled yet. Matches will appear here once
                      they have been generated for this block.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </>
  );
}
