import {
HandicapChangeEntityType,
HandicapChangeAction
} from './type';
import { LucideIcon } from 'lucide-react';

export interface menu {
  id: string;
  label: string;
  icon: any;
}

export interface Capability {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  color: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface FeatureDetail {
  id: string;
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  image: string;
}

export interface HowItWorksStep {
  id: string;
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface LandingStat {
  id: string;
  label: string;
  value: string;
}

export interface User {
  id: string | number;
  user_name?: string;
}

export interface NewUser {
  id: string | number;
  user_name: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardData {
  total_blocks: number;
  total_teams: number;
  total_players: number;
  blocks: Record<string, DashboardBlockStats>;
  average_matches_per_week: number;
  completion_percentage: number;
  completed_matches: number;
  scheduled_matches: number;
  upcoming_matches: DashboardUpcomingMatch[];
}

export interface DashboardUpcomingMatch {
  match_id: number;
  block_number: number;
  week_number: number;
  lane: string;
  team1_name: string;
  team2_name: string;
}

export interface DashboardBlockStats {
  completed: number;
  pending: number;
  total: number;
}

export interface League {
  id: string | number;
  name: string;
  user_id: string | number;
  season_name?: string | null;
  league_format?: string;
  number_of_weeks?: number;
  number_of_teams?: number;
  number_of_blocks?: number;
  games_per_week?: string | number;
  players_per_game?: string | number;
  starting_lane?: string | number;
  total_lanes?: string | number;
  created_at?: string;
  updated_at?: string;
  setup_completed?: boolean;
  setup_completed_at?: string | null;
  is_active?: boolean;
  setup_config?: Record<string, unknown> | null;
}

export interface MatchData {
  block_id: string;
  week_number: number;
  lane: string;
  hasScore: boolean;
  team1: TeamData;
  team2: TeamData;
  match_id: number;
  status: 'completed' | 'pending';
  block1?: MatchData[];
  block2?: MatchData[];
}

export interface TeamData {
  id: number;
  name: string;
  totalHdc: number;
  scoreEntered: boolean;
  players: PlayerScoreDetails[];
}

export interface PlayerScoreDetails {
  id: number;
  name: string;
  [key: `g${number}`]: number | undefined;
  scratch?: number;
  hdc?: number;
  totalWHdc?: number;
  avg?: number;
}

export interface LeagueSummary {
  league_id: number;
  has_blocks: boolean;
  team_count: number;
}

export interface BlockWeekCalculation {
  totalWeeks: number;
}

export interface HandicapSetting {
  id: string | number;
  league_id: string | number;
  average: number;
  men_handicap: number;
  women_handicap: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueHandicapConfig {
  id: string | number;
  league_id: string | number;
  men_max_handicap: number;
  women_max_handicap: number;
  created_at?: string;
  updated_at?: string;
}

export interface HandicapChangeHistory {
  id: number;
  league_id: string | number;
  entity_type: HandicapChangeEntityType;
  entity_id: string | number | null;
  action: HandicapChangeAction;
  before_values: Record<string, unknown> | null;
  after_values: Record<string, unknown> | null;
  actor_id: string | null;
  changed_at: string;
}

export interface HandicapImportRow {
  rowNumber: number;
  averageText: string;
  menHandicapText: string;
  womenHandicapText: string;
  average: number | null;
  men_handicap: number | null;
  women_handicap: number | null;
  errors: string[];
}

export interface HandicapImportPreview {
  rows: HandicapImportRow[];
  dataRowCount: number;
  validCount: number;
  invalidCount: number;
  errors: string[];
}

export interface LeagueTeam {
  id: string | number;
  name: string;
  league_id: string | number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueMember {
  id: string | number;
  name: string;
  team_id?: string | number;
  league_id?: string | number;
  type?: 'regular' | 'substitute';
  gender?: 'male' | 'female' | string | null;
  status?: string;
  position?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
}

export interface LeagueTeamWithMembers extends LeagueTeam {
  members: LeagueMember[];
}

export interface LeagueBlock {
  id: string | number;
  number: number;
  league_id: string | number;
}

export interface Lane {
  id: string | number;
  lane: string;
  league_id?: string | number;
}

// // export interface Player {
// //   id: string;
// //   name: string;
// //   teamId: string;
// //   isSubstitute?: boolean;
// //   transferHistory?: PlayerTransfer[];
// // }

// // export interface PlayerTransfer {
// //   id: string;
// //   fromTeamId: string;
// //   fromTeamName: string;
// //   toTeamId: string;
// //   toTeamName: string;
// //   transferDate: string;
// //   blockNumber: number;
// //   weekNumber: number;
// // }

// // export interface LeagueSettings {
// //   id: string | number;
// //   league_id: string | number;
// //   games_per_week: number;
// //   starting_lane: number;
// //   created_at?: string;
// // }

// // // export interface PlayerStat {
// // //   playerId: string;
// // //   name: string;
// // //   teamId: string;
// // //   teamName: string;
// // //   average: number;
// // //   highGame: number;
// // //   lowGame: number;
// // //   gamesPlayed: number;
// // //   totalPins: number;
// // //   consistency: number;
// // //   games: number[];
// // // }

// export interface PlayerWithTeam extends LeagueMember {
//   teamName: string;
//   average?: number | null;
//   gamesPlayed?: number;
// }

// export interface PlayerLeagueStats {
//   average: number | null;
//   gamesPlayed: number;
// }

/////
