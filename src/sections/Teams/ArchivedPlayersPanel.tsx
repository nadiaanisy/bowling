import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { restorePlayer } from '../../utils/api/teamArchive';
import { supabase } from '../../utils/supabase/supabaseClient';

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
    <section className="rounded-xl border border-violet-900/70 bg-[#11131f] p-4 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Archived players</h2>
          <p className="text-sm text-gray-500">
            Restore players to their original teams.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : `View (${players.length})`}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void loadArchivedPlayers()}
              disabled={loading}
              className="text-sm underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-500">Loading archived players…</p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && players.length === 0 && (
            <p className="text-sm text-gray-500">
              No archived players in this league.
            </p>
          )}

          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{player.name}</p>
                <p className="text-xs text-gray-500">
                  Team: {player.team?.name ?? 'Unavailable'}
                  {player.team?.archived_at ? ' (archived)' : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleRestore(player)}
                disabled={restoringId !== null}
                className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {restoringId === player.id ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
