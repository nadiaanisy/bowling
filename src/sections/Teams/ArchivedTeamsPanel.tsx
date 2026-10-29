import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { Button } from '../../components/button';
import { restoreTeam } from '../../utils/api/teamArchive';
import { supabase } from '../../utils/supabase/supabaseClient';
import { RefreshCw } from 'lucide-react';

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
    <section className="rounded-xl border border-violet-800/90 bg-gradient-to-br from-[#11131f] to-[#0e101b] p-3.5 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Archived teams</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Archived teams are hidden from the active roster.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-lg border border-slate-700 bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-violet-600 hover:bg-violet-950/40"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : `View (${teams.length})`}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadArchivedTeams()}
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
              Loading archived teams…
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-emerald-400">
              {message}
            </p>
          )}

          {!loading && !error && teams.length === 0 && (
            <p className="text-xs leading-relaxed text-slate-400">
              No archived teams in this league.
            </p>
          )}

          <div className="max-h-[14rem] space-y-3 overflow-y-auto overscroll-contain pr-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0b0c14]/70 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{team.name}</p>
                  <p className="text-xs text-slate-500">
                    Archived{' '}
                    {team.archived_at
                      ? new Date(team.archived_at).toLocaleDateString('en-GB')
                      : ''}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRestore(team)}
                  disabled={restoringId !== null}
                  className="shrink-0 border-slate-700 bg-[#11131f] text-xs text-slate-100 hover:border-violet-600 hover:bg-violet-950/40 disabled:opacity-50"
                >
                  {restoringId === team.id ? 'Restoring…' : 'Restore'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
