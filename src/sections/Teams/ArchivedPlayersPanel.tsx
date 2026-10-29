import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { Button } from '../../components/button';
import { restorePlayer } from '../../utils/api/teamArchive';
import { supabase } from '../../utils/supabase/supabaseClient';
import { RefreshCw } from 'lucide-react';

type ArchivedPlayer = {
  id: number;
  name: string;
  team_id: number;
  league_id: number;
  archived_at: string | null;
  team: {
    name: string;
    archived_at: string | null;
  } | null;
};

type Props = {
  leagueId: string | number | null;
  refreshKey: number;
  onRestored: () => void;
};

export default function ArchivedPlayersPanel({
  leagueId,
  refreshKey,
  onRestored,
}: Props) {
  const [players, setPlayers] = useState<ArchivedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadArchivedPlayers = useCallback(async () => {
    if (leagueId === null) {
      setPlayers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('players')
        .select(
          `
          id,
          name,
          team_id,
          league_id,
          archived_at,
          team:teams!players_team_id_fkey(name, archived_at)
        `,
        )
        .eq('league_id', leagueId)
        .not('archived_at', 'is', null)
        .order('name', { ascending: true });

      if (queryError) throw queryError;

      setPlayers((data ?? []) as unknown as ArchivedPlayer[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load archived players.',
      );
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    void loadArchivedPlayers();
  }, [loadArchivedPlayers, refreshKey]);

  const handleRestore = async (player: ArchivedPlayer) => {
    if (restoringId !== null) return;

    if (player.team?.archived_at) {
      setError(
        `Restore "${player.team.name}" first, then restore this player.`,
      );
      return;
    }

    if (!player.team) {
      setError(
        `Cannot restore "${player.name}" because its original team could not be found.`,
      );
      return;
    }

    setRestoringId(player.id);
    setError(null);

    try {
      await restorePlayer(player.id, player.team_id, player.league_id);

      setPlayers((current) => current.filter((item) => item.id !== player.id));

      onRestored();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to restore player.',
      );
      await loadArchivedPlayers();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="rounded-xl border border-violet-800/90 bg-gradient-to-br from-[#11131f] to-[#0e101b] p-3.5 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Archived players</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Restore players to their original teams.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-lg border border-slate-700 bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-violet-600 hover:bg-violet-950/40"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : `View (${players.length})`}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadArchivedPlayers()}
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
              Loading archived players…
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && players.length === 0 && (
            <p className="text-xs leading-relaxed text-slate-400">
              No archived players in this league.
            </p>
          )}

          <div className="max-h-[14rem] space-y-3 overflow-y-auto overscroll-contain pr-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0b0c14]/70 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{player.name}</p>
                  <p className="text-xs text-slate-500">
                    Team: {player.team?.name ?? 'Unavailable'}
                    {player.team?.archived_at ? ' (archived)' : ''}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRestore(player)}
                  disabled={restoringId !== null}
                  className="shrink-0 rounded-lg border border-slate-700 bg-[#11131f] px-3 py-2 text-xs font-semibold text-slate-100 hover:border-violet-600 hover:bg-violet-950/40 disabled:opacity-50"
                >
                  {restoringId === player.id ? 'Restoring…' : 'Restore'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
