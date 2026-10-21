// import type { Dispatch, SetStateAction } from 'react';
import { LucideIcon } from 'lucide-react';

// export interface ContextType {
//   isAuthenticated: boolean;
//   userData: User | null;
//   listOfLeaguesByUser: League[];
//   isLoadingLeagues: boolean;
//   leagueLoadError: string | null;
//   needsLeagueSetup: boolean;
//   selectedLeague: string | null;
//   hasBlock: boolean;
//   isLoadingSkeleton: boolean;
//   dashboardData: DashboardData | null;

//   login: (username: string, password: string) => Promise<boolean>;
//   retryLoadLeagues: () => Promise<void>;
//   logout: () => void;
//   sessionExpired: boolean;
//   changeLeague: () => void;
//   selectLeague: (league: {
//     id: string | number;
//     hasBlocks?: boolean;
//   }) => Promise<boolean>;

//   setIsAuthenticated: (value: boolean) => void;
//   setUserData: (data: User | null) => void;
//   setListOfLeaguesByUser: Dispatch<SetStateAction<League[]>>;
//   setSelectedLeague: (leagueId: string | null) => void;
//   setHasBlock: (hasBlock: boolean) => void;
//   setIsLoadingLeagues: (isLoading: boolean) => void;
//   setIsLoadingSkeleton: (isLoading: boolean) => void;
//   setDashboardData: (data: DashboardData | null) => void;
// }
export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface LandingStat {
  id: string;
  label: string;
  value: string;
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

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Capability {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  color: string;
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

export interface League {
  id: string | number;
  name: string;
  user_id: string | number;
  games_per_week?: string | number;
  players_per_game?: string | number;
  starting_lane?: string | number;
  total_lanes?: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueSummary {
  league_id: number;
  has_blocks: boolean;
  team_count: number;
}

export interface BlockWeekCalculation {
  totalWeeks: number;
}

export interface DashboardData {
  total_blocks: number;
  total_teams: number;
  total_players: number;
  blocks: Record<string, DashboardBlockStats>;
  average_matches_per_week: number;
  completion_percentage: number;
}

export interface DashboardBlockStats {
  completed: number;
  pending: number;
  total: number;
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

export type MatchesByBlock = Record<string, MatchData[]>;

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
