import { Team } from '../../utils/type';
import {
  UsersRound,
  UserRound,
  UserRoundCheck,
  Users
} from 'lucide-react';

type Props = {
  teams: Team[];
};

export default function TeamRosterSummary({ teams }: Props) {
  const activeTeams = teams.filter((team) => !team.archived_at);

  const players = activeTeams.flatMap((team) =>
    team.members.filter((player) => !player.archived_at),
  );

  const activePlayers = players.filter(
    (player) => (player.status ?? '').toLowerCase() === 'active',
  );

  const teamsWithPlayers = activeTeams.filter((team) =>
    team.members.some((player) => !player.archived_at),
  );

  const stats = [
    {
      label: 'Teams',
      value: activeTeams.length,
      icon: UsersRound,
      tone: 'violet',
    },
    { label: 'Players', value: players.length, icon: UserRound, tone: 'blue' },
    {
      label: 'Active players',
      value: activePlayers.length,
      icon: UserRoundCheck,
      tone: 'green',
    },
    {
      label: 'Teams with players',
      value: teamsWithPlayers.length,
      icon: Users,
      tone: 'violet',
    },
  ];

  return (
    <section
      aria-label="Team roster summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-violet-800/90 bg-gradient-to-br from-[#11131f] to-[#0e101b] p-3.5 shadow-sm transition-colors hover:border-violet-600/80 sm:p-4"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${stat.tone === 'green' ? 'bg-emerald-900/50 text-emerald-400 ring-emerald-800/60' : stat.tone === 'blue' ? 'bg-indigo-950/80 text-indigo-300 ring-indigo-800/60' : 'bg-violet-950/80 text-violet-300 ring-violet-800/60'}`}
          >
            <stat.icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-300 sm:text-sm">{stat.label}</p>
            <p
              className={`mt-1 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${index === 2 ? 'text-emerald-400' : 'text-white'}`}
            >
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
