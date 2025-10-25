import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  useBowlingHook,
  useCustomHook
} from '../others/misc';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { leagues_table } from '../others/data';
import { supabase } from '../../utils/supabaseClient';

export default function LeagueSelection() {
  const {
    leagues,
    setLeagues,
    isLoadingSkeleton,
    setIsLoadingSkeleton
  } = useCustomHook();
  const { selectLeague } = useBowlingHook();

  /* Fetch League List */
  const fetchLeagues = async () => {
    try {
      setIsLoadingSkeleton(true);
      const { data, error } = await supabase.from(leagues_table).select('*');
      if (error) {
        toast.error('Error fetching leagues: ' + error.message);
        return;
      }
      setLeagues(data || [])
    } catch (error) {
      toast.error('Error fetching leagues: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoadingSkeleton(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
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
              Array.from({ length: leagues.length }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))
            ): leagues.length === 0 ? (
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
