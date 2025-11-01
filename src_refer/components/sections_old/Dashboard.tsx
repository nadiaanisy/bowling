import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useCustomHook } from '../others/misc';
import { supabase } from '../../utils/supabaseClient';
import { players_table, teams_table } from '../others/data';

export default function Dashboard() {

  const {
    totalTeams,
    setTotalTeams,
    totalPlayers,
    setTotalPlayers
  } = useCustomHook();
  
  // const block1 = data.blocks.find(b => b.number === 1);
  // const block2 = data.blocks.find(b => b.number === 2);
  
  // const block1Completed = block1?.matches.filter(m => m.team1Scores && m.team2Scores).length || 0;
  // const block2Completed = block2?.matches.filter(m => m.team1Scores && m.team2Scores).length || 0;

  const fetchTotalTeams = async () => {
    try {
      const { count, error } = await supabase
        .from(teams_table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        toast.error('Error fetching total teams: ' + error.message);
        return;
      }

      setTotalTeams(count || 0);
    } catch (error) {
      toast.error('Error fetching total teams: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTotalTeams(0);
    }
  };

  const fetchTotalPlayers = async () => {
    try {
      const { count, error } = await supabase
        .from(players_table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        toast.error('Error fetching total players: ' + error.message);
        return;
      }

      setTotalPlayers(count || 0);
    } catch (error) {
      toast.error('Error fetching total players: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTotalPlayers(0);
    }
  }

  useEffect(() => {
    fetchTotalTeams();
    fetchTotalPlayers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bowling league</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Teams</CardDescription>
            <CardTitle className="text-4xl">{totalTeams}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            <CardTitle className="text-4xl">
              {totalPlayers}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* <Card>
          <CardHeader className="pb-3">
            <CardDescription>Block 1 Progress</CardDescription>
            <CardTitle className="text-4xl">{block1Completed}/31</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {block1Completed === 31 ? 'Completed' : `${31 - block1Completed} weeks remaining`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Block 2 Progress</CardDescription>
            <CardTitle className="text-4xl">{block2Completed}/31</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {block2Completed === 31 ? 'Completed' : `${31 - block2Completed} weeks remaining`}
            </div>
          </CardContent>
        </Card>*/}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Block 1</CardTitle>
            <CardDescription>First 31 weeks</CardDescription>
          </CardHeader>
          {/* <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Matches Scheduled:</span>
                <span className="text-sm">{block1?.matches.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Matches Completed:</span>
                <span className="text-sm">{block1Completed}</span>
              </div>
            </div>
          </CardContent> */}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Block 2</CardTitle>
            <CardDescription>Weeks 32-62</CardDescription>
          </CardHeader>
          {/* <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Matches Scheduled:</span>
                <span className="text-sm">{block2?.matches.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Matches Completed:</span>
                <span className="text-sm">{block2Completed}</span>
              </div>
            </div>
          </CardContent> */}
        </Card>
      </div>
    </div>
  );
}
