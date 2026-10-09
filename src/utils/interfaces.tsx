// import type { Dispatch, SetStateAction } from 'react';

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

export interface User {
  id: string | number;
  user_name?: string;
}

// export interface NewUser {
//   id: string | number;
//   user_name: string;
//   name: string;
//   created_at?: string;
//   updated_at?: string;
// }

export interface DashboardData {
  total_blocks: number;
  total_teams: number;
  total_players: number;
  blocks: Record<string, DashboardBlockStats>;
  average_matches_per_week: number;
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
  games_per_week?: string | number;
  players_per_game?: string | number;
  starting_lane?: string | number;
  total_lanes?: string | number;
  created_at?: string;
  updated_at?: string;
}

// export type MatchesByBlock = Record<string, MatchData[]>;

// export interface MatchData {
//   block_id: string;
//   week_number: number;
//   lane: string;
//   hasScore: boolean;
//   team1: TeamData;
//   team2: TeamData;
//   match_id: number;
//   status: 'completed' | 'pending';
//   block1?: MatchData[];
//   block2?: MatchData[];
// }

// export interface TeamData {
//   id: number;
//   name: string;
//   totalHdc: number;
//   scoreEntered: boolean;
//   players: PlayerScoreDetails[];
// }

// export interface PlayerScoreDetails {
//   id: number;
//   name: string;
//   [key: `g${number}`]: number | undefined;
//   scratch?: number;
//   hdc?: number;
//   totalWHdc?: number;
//   avg?: number;
// }

// export interface LeagueTeam {
//   id: string | number;
//   name: string;
//   league_id: string | number;
//   notes?: string | null;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface LeagueMember {
//   id: string | number;
//   name: string;
//   team_id?: string | number;
//   league_id?: string | number;
//   type?: 'regular' | 'substitute';
//   status?: string;
//   position?: string | null;
//   notes?: string | null;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface LeagueTeamWithMembers extends LeagueTeam {
//   members: LeagueMember[];
// }

// export interface LeagueBlock {
//   id: string | number;
//   number: number;
//   league_id: string | number;
// }

// export interface Lane {
//   id: string | number;
//   lane: string;
//   league_id?: string | number;
// }
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

// export interface HandicapSetting {
//   id: string | number;
//   league_id: string | number;
//   average: number;
//   handicap: number;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface HandicapRule {
//   id: string | number;
//   league_id?: string | number;
//   average: number;
//   handicap: number;
//   created_at?: string;
//   updated_at?: string;
// }
