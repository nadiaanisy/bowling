import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { useEffect } from 'react';
import { useCustomHook } from '../misc';
import { fetchDashboardData } from '../api';
import { Skeleton } from '../ui/skeleton';

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
      const data = await fetchDashboardData(selectedLeague);
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
                <CardTitle className="text-4xl">
                  {dashboardData?.total_teams}
                </CardTitle>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Total Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            {isLoadingSkeleton ? (
              <Skeleton className="h-10 w-10" />
            ) : (
              <CardTitle className="text-4xl">
                {dashboardData?.total_players}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-5" >
        {Array.from({ length: dashboardData?.total_blocks }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardDescription>Block {index + 1} Progress</CardDescription>
              {/* <CardTitle className="text-4xl">{block1Completed}/31</CardTitle> */}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {/* {block1Completed === 31 ? 'Completed' : `${31 - block1Completed} weeks remaining`} */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Block 1</CardTitle>
            <CardDescription>First 31 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Matches Scheduled:</span>
                {/* <span className="text-sm">{block1?.matches.length || 0}</span> */}
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Matches Completed:</span>
                {/* <span className="text-sm">{block1Completed}</span> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Block 2</CardTitle>
            <CardDescription>Weeks 32-62</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Matches Scheduled:</span>
                {/* <span className="text-sm">{block2?.matches.length || 0}</span> */}
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Matches Completed:</span>
                {/* <span className="text-sm">{block2Completed}</span> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
