export type PlayerRosterType = 'regular' | 'substitute';
export type PlayerStatus = 'active' | 'inactive';

export const PLAYER_CARD_CLASS =
  'rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#17131f] to-[#100d17]';
export const PLAYER_INPUT_CLASS =
  'w-full min-w-0 rounded-lg border border-violet-300/15 bg-[#0b0912] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20';
export const PLAYER_DEFAULT_FILTERS = {
  team: 'all',
  rosterType: 'all',
  status: 'all',
} as const;
export const PLAYER_DEFAULT_STATUS: PlayerStatus = 'active';
export const PLAYER_SETUP_RULE_KEYS = {
  maxRosterSize: 'max_roster_size',
  gradedBowlersMin: 'graded_bowlers_min',
  openBowlersMax: 'open_bowlers_max',
  openAverageThreshold: 'open_average_threshold',
  minimumPlayersStart: 'minimum_players_start',
  allowOpenBowlers: 'allow_open_bowlers',
  allowSubstitutes: 'allow_substitutes',
} as const;
export const PLAYER_ROSTER_TYPE_OPTIONS: Array<{
  value: PlayerRosterType;
  label: string;
}> = [
  { value: 'regular', label: 'Regular' },
  { value: 'substitute', label: 'Substitute' },
];
export const PLAYER_STATUS_OPTIONS: Array<{
  value: PlayerStatus;
  label: string;
}> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
