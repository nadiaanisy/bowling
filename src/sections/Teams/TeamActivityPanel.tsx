import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { Button } from '../../components/button';
import {
  getTeamActivity,
  type TeamActivity,
} from '../../utils/api/teamArchive';
import { RefreshCw } from 'lucide-react';

type Props = {
  leagueId: string | number | null;
  refreshKey?: number;
};

function describeActivity(activity: TeamActivity): string {
  const details = activity.details ?? {};
  const playerName =
    typeof details.player_name === 'string' ? details.player_name : 'a player';

  switch (activity.action) {
    case 'team.archived':
      return 'Team archived';
    case 'team.restored':
      return 'Team restored';
    case 'player.archived':
      return `${playerName} archived`;
    case 'player.restored':
      return `${playerName} restored`;
    case 'team.created':
      return 'Team created';
    case 'team.updated':
      return 'Team details updated';
    case 'team.deleted':
      return 'Team deleted';
    case 'player.created':
      return 'Player added';
    case 'player.updated':
      return 'Player details updated';
    case 'player.transferred':
      return 'Player transferred';
    default:
      return activity.action
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

export default function TeamActivityPanel({ leagueId, refreshKey = 0 }: Props) {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadActivity = useCallback(async () => {
    if (leagueId === null) {
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTeamActivity(leagueId, 50);
      setActivities(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load activity history.',
      );
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity, refreshKey]);

  return (
    <section className="rounded-xl border border-violet-800/90 bg-gradient-to-br from-[#11131f] to-[#0e101b] p-3.5 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Activity history</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Recent recorded changes in this league.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-lg border border-slate-700 bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-violet-600 hover:bg-violet-950/40"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : 'View history'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadActivity()}
              disabled={loading}
              className="gap-2 border-slate-700 bg-[#0b0c14] text-slate-100 hover:border-violet-600 hover:bg-violet-950/40"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {loading && (
            <p className="text-xs leading-relaxed text-slate-400">
              Loading activity…
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && activities.length === 0 && (
            <p className="text-xs leading-relaxed text-slate-400">
              No activity has been recorded yet.
            </p>
          )}

          <div className="max-h-[15rem] space-y-3 overflow-y-auto overscroll-contain pr-2">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-lg border border-slate-800 bg-[#0b0c14]/70 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{describeActivity(activity)}</p>
                  <time
                    className="text-xs text-slate-500"
                    dateTime={activity.created_at}
                  >
                    {new Date(activity.created_at).toLocaleString()}
                  </time>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {activity.team_id !== null
                    ? `Team ID: ${activity.team_id}`
                    : 'Team no longer associated with this record'}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
