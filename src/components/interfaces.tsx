export interface BowlingContextType {
  isAuthenticated: boolean;
  selectedLeague: string | null;
  selectedLeagueName: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  selectLeague: (leagueId: string) => void;
  setSelectedLeague: (leagueId: string | null) => void;
  changeLeague: (league: any) => void;
  userId?: number | null;
  userName?: string | null;
  leagues?: any[];
  hasBlock?: boolean;
  
// //   data: BowlingData;
// //   addTimetableMatch: (week: number, team1Id: string, team2Id: string, blockNumber: 1 | 2) => void;
// //   updateMatchScores: (blockNumber: 1 | 2, weekNumber: number, matchIndex: number, team1Scores: any[], team2Scores: any[]) => void;
// //   getBlock: (blockNumber: 1 | 2) => Block;
};



export interface PlayerScoreDetails {
  id: number;
  name: string;
  g1: number;
  g2: number;
  g3: number;
  scratch: number;
  hdc: number;
  totalWHdc: number;
  avg: number;
}

export interface TeamData {
  id: number;
  name: string;
  totalHdc: number;
  scoreEntered: boolean;
  players: PlayerScoreDetails[];
}

export interface MatchData {
  block_id: string;
  week_number: number;
  lane: string;
  hasScore: boolean;
  team1: TeamData;
  team2: TeamData;
  match_id: number;
  block1?: MatchData[];
  block2?: MatchData[];
}

export interface PlayerStat {
  playerId: string;
  name: string;
  teamId: string;
  teamName: string;
  average: number;
  highGame: number;
  lowGame: number;
  gamesPlayed: number;
  totalPins: number;
  consistency: number;
  games: number[];
}