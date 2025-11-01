export interface LeagueList {
  id: string;
  name: string;
}


export interface Player {
  id: string;
  name: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

/* NANTI CHECK */
export interface WeeklyScore {
  playerId: string;
  playerName: string;
  game1: number;
  game2: number;
  game3: number;
  total: number;
}

export interface WeeklyMatch {
  week: number;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  team1Scores?: WeeklyScore[];
  team2Scores?: WeeklyScore[];
}

export interface Block {
  number: 1 | 2;
  matches: WeeklyMatch[];
}

export interface BowlingData {
  teams: Team[];
  blocks: Block[];
  timetable: WeeklyMatch[];
}

export interface League {
  id: string;
  name: string;
  data: BowlingData;
}

export const LEAGUES = [
  { id: 'sunray', name: 'Sunray League' },
  { id: 'sunshine', name: 'Sunshine League' },
  { id: 'valuefest', name: 'Valuefest League' }
];

export interface BowlingContextType {
  isAuthenticated: boolean;
  selectedLeague: string | null;
  selectedLeagueName: string | null;
  login: (password: string) => boolean;
  logout: () => void;
  selectLeague: (leagueId: string) => void;
  
  data: BowlingData;
  addTimetableMatch: (week: number, team1Id: string, team2Id: string, blockNumber: 1 | 2) => void;
  updateMatchScores: (blockNumber: 1 | 2, weekNumber: number, matchIndex: number, team1Scores: any[], team2Scores: any[]) => void;
  getBlock: (blockNumber: 1 | 2) => Block;
}