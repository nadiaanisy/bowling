type Player = {
  id: string | number;
  name: string;
  status?: string | null;
  type?: string | null;
  archived_at?: string | null;
};

type Team = {
  id: string | number;
  name: string;
  members: Player[];
  archived_at?: string | null;
};

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
    { label: 'Teams', value: activeTeams.length },
    { label: 'Players', value: players.length },
    { label: 'Active players', value: activePlayers.length },
    { label: 'Teams with players', value: teamsWithPlayers.length },
  ];

  return (
    <section
      aria-label="Team roster summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-xl border border-violet-900/70 bg-[#11131f] p-4 shadow-sm transition-colors hover:border-violet-600/70"
        >
          <p className="text-sm text-slate-400">{stat.label}</p>
          <p
            className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${
              index === 2 ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}
