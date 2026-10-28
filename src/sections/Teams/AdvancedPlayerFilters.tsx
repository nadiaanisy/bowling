import { useMemo } from 'react';
import { AdvancedPlayerFiltersValue } from '../../utils/interfaces';

type Team = {
  id: string | number;
  name: string;
  members: Array<{
    status?: string | null;
    type?: string | null;
    archived_at?: string | null;
  }>;
};

type Props = {
  teams: Team[];
  value: AdvancedPlayerFiltersValue;
  onChange: (value: AdvancedPlayerFiltersValue) => void;
};

const inputClass =
  'w-full min-w-0 rounded-md border border-slate-700 bg-[#0b0c14] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500';

export default function AdvancedPlayerFilters({
  teams,
  value,
  onChange,
}: Props) {
  const options = useMemo(() => {
    const statuses = new Set<string>();
    const types = new Set<string>();

    teams.forEach((team) => {
      team.members.forEach((player) => {
        if (player.archived_at) return;

        if (player.status?.trim()) {
          statuses.add(player.status.trim());
        }

        if (player.type?.trim()) {
          types.add(player.type.trim());
        }
      });
    });

    return {
      statuses: Array.from(statuses).sort(),
      types: Array.from(types).sort(),
    };
  }, [teams]);

  const update = (patch: Partial<AdvancedPlayerFiltersValue>) => {
    onChange({ ...value, ...patch });
  };

  const hasFilters = Object.values(value).some(Boolean);

  return (
    <section className="rounded-xl border border-violet-900/70 bg-[#11131f] p-4 text-slate-100 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Advanced player search</h2>
          <p className="mt-1 text-sm text-slate-400">
            Filter the roster by player, team, status, or type.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="text-sm text-violet-300 hover:text-violet-200"
            onClick={() =>
              onChange({
                playerName: '',
                teamId: '',
                status: '',
                playerType: '',
              })
            }
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          aria-label="Player name filter"
          className={inputClass}
          placeholder="Player name"
          value={value.playerName}
          onChange={(event) => update({ playerName: event.target.value })}
        />

        <select
          aria-label="Filter by team"
          className={inputClass}
          value={value.teamId}
          onChange={(event) => update({ teamId: event.target.value })}
        >
          <option value="">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={String(team.id)}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by player status"
          className={inputClass}
          value={value.status}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          {options.statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by player type"
          className={inputClass}
          value={value.playerType}
          onChange={(event) => update({ playerType: event.target.value })}
        >
          <option value="">All player types</option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
