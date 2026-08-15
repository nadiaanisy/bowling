import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/card';
import { motion } from 'motion/react';
import { Skeleton } from '../components/skeleton';
import type { DashboardData } from '../utils/interfaces';

interface SummaryCardProps {
  label: string;
  value: number;
  isLoading: boolean;
}

export function DashboardSummaryCard({ label, value, isLoading }: SummaryCardProps) {
  return (
    <motion.div
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
                <div>{value}</div>
                {value === 0 && (
                  <p className="text-xs font-normal text-muted-foreground">No data</p>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

interface BlockCardsProps {
  totalBlocks: number;
  dashboardData: DashboardData | null;
  matchesPerWeek: number;
  isLoading: boolean;
  loadingBlockCount: number;
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
              <CardContent><Skeleton className="h-4 w-32" /></CardContent>
            </Card>
          </motion.div>
        ))}
      </>
    );
  }

  return (
    <div className="contents">
      {Array.from({ length: totalBlocks }).map((_, index) => {
        const block = dashboardData?.blocks?.[`block${index + 1}`];
        const total = block?.total ?? 0;
        const completed = block?.completed ?? 0;
        const totalWeeks = total > 0 ? Math.ceil(total / matchesPerWeek) : 0;
        const completedWeeks = total > 0 ? Math.floor(completed / matchesPerWeek) : 0;
        const weeksLeft = Math.max(totalWeeks - completedWeeks, 0);
        const status = totalWeeks === 0
          ? 'No data'
          : completedWeeks >= totalWeeks
          ? 'Completed'
          : weeksLeft === 0
          ? 'No weeks remaining'
          : `${weeksLeft} weeks remaining`;

        return (
          <motion.div
            key={`progress-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Block {index + 1} Progress</CardDescription>
                <CardTitle className="text-4xl">{`${completedWeeks}/${totalWeeks} weeks`}</CardTitle>
              </CardHeader>
              <CardContent><div className="text-sm text-muted-foreground">{status}</div></CardContent>
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
        <CardContent className="py-8 text-center text-muted-foreground">
          No blocks have been configured for this league yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {Array.from({ length: totalBlocks }).map((_, index) => {
        const blockKey = `block${index + 1}`;
        const blockData = dashboardData?.blocks?.[blockKey];
        const total = blockData?.total ?? 0;
        const completed = blockData?.completed ?? 0;
        const pending = blockData?.pending ?? 0;
        const weeksRemaining = pending > 0 ? Math.ceil(pending / matchesPerWeek) : 0;
        const weekLabel = weeksRemaining === 1 ? 'week' : 'weeks';

        return (
          <motion.div
            key={`summary-${blockKey}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Block {index + 1}</CardTitle>
                <CardDescription>{total ? `Total ${total} matches` : 'No matches found'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Matches Scheduled:</span><span className="text-sm">{total}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Matches Completed:</span><span className="text-sm">{completed}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Matches Pending:</span><span className="text-sm">{pending}</span></div>
                  <div className="text-sm text-muted-foreground">
                    {total === 0 ? 'No schedule' : completed >= total ? 'Completed' : `${weeksRemaining} ${weekLabel} remaining`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </>
  );
}
