import {
  useBowlingHook,
  useCustomHook
} from '../misc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { fetchLeagueList } from '../functions';

export default function LeagueSelection() {
  const {
    leagues,
    setLeagues,
    isLoadingSkeleton,
    setIsLoadingSkeleton
  } = useCustomHook();
  const { selectLeague } = useBowlingHook();

  useEffect(() => {
    const loadLeagues = async () => {
      setIsLoadingSkeleton(true);
      const data = await fetchLeagueList();
      setLeagues(data);
      setIsLoadingSkeleton(false);
    };

    loadLeagues();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-bold">Select a League</CardTitle>
          <CardDescription>Choose which bowling league you want to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-3"
            style={{borderStyle: 'var(--tw-border-style)', borderWidth: '1px', borderRadius: '8px', borderColor: '#0000001a'}}
          >
            {isLoadingSkeleton ? (
              Array.from({ length: leagues.length }).map((_, index) => (
                <Skeleton key={index} className="h-auto w-full" />
              ))
            ) : leagues.length === 0 ? (
              <div className="text-center text-muted-foreground">No leagues available</div>
            ) : (
              leagues.map((league) => (
                <Button
                  key={league.id}
                  variant="outline"
                  className="w-full h-auto py-4 justify-start"
                  onClick={() => selectLeague(league)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div>{league.name}</div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
