import { MatchData } from './interfaces';

export type Player = {
  id: string | number;
  name: string;
  status?: string | null;
  type?: string | null;
  archived_at?: string | null;
};
export type Team = {
  id: string | number;
  name: string;
  members: Player[];
  archived_at?: string | null;
};

export type AdvancedPlayerFiltersValue = {
  playerName: string;
  teamId: string;
  status: string;
  playerType: string;
};

export type MatchesByBlock = Record<string, MatchData[]>;

export type HandicapChangeAction = 'created' | 'updated' | 'deleted';

export type HandicapChangeEntityType = 'handicap_rule' | 'league_config';
