import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { restoreTeam } from '../../utils/api/teamArchive';
import { supabase } from '../../utils/supabase/supabaseClient';

type ArchivedTeam = {
  id: number;
  name: string;
  league_id: number;
  archived_at: string | null;
};

type Props = {
  leagueId: string | number | null;
  refreshKey: number;
  onRestored: () => void;
};

export default function ArchivedTeamsPanel({
  leagueId,
  refreshKey,
  onRestored,
}: Props) {
  const [teams, setTeams] = useState<ArchivedTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadArchivedTeams = useCallback(async () => {
    if (leagueId === null) {
      setTeams([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('teams')
        .select('id, name, league_id, archived_at')
        .eq('league_id', leagueId)
        .not('archived_at', 'is', null)
        .order('name', { ascending: true });

      if (queryError) throw queryError;

      setTeams((data ?? []) as ArchivedTeam[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load archived teams.',
      );
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    void loadArchivedTeams();
  }, [loadArchivedTeams, refreshKey]);

  const handleRestore = async (team: ArchivedTeam) => {
    if (restoringId !== null) return;

    setRestoringId(team.id);
    setError(null);
    setMessage(null);

    try {
      await restoreTeam(team.id, team.league_id);
      setTeams((current) => current.filter((item) => item.id !== team.id));
      setMessage(`"${team.name}" was restored.`);
      onRestored();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to restore team.');
      await loadArchivedTeams();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="rounded-xl border border-violet-900/70 bg-[#11131f] p-4 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Archived teams</h2>
          <p className="text-sm text-gray-500">
            Archived teams are hidden from the active roster.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : `View (${teams.length})`}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void loadArchivedTeams()}
              disabled={loading}
              className="text-sm underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-500">Loading archived teams…</p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          {!loading && !error && teams.length === 0 && (
            <p className="text-sm text-gray-500">
              No archived teams in this league.
            </p>
          )}

          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{team.name}</p>
                <p className="text-xs text-gray-500">
                  Archived{' '}
                  {team.archived_at
                    ? new Date(team.archived_at).toLocaleDateString('en-GB')
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleRestore(team)}
                disabled={restoringId !== null}
                className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {restoringId === team.id ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
