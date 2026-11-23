import {
LeagueMember,
MatchData
} from './interfaces';
import type { LucideIcon } from 'lucide-react';

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
export type NavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  available?: boolean;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type BlockSetupDialogField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'time' | 'select' | 'toggle' | 'check';
  placeholder?: string;
  hint?: string;
  options?: string[];
  required?: boolean;
};

export type BlockSetupDialogGroup = {
  title: string;
  fields: BlockSetupDialogField[];
};

export type BlockSetupDialogFormValues = Record<string, string | boolean>;

export type HandicapChangeAction = 'created' | 'updated' | 'deleted';

export type HandicapChangeEntityType = 'handicap_rule' | 'league_config';

export type PlayerRow = LeagueMember & { teamName: string };
export type PendingPlayerAction = {
  action: 'archive' | 'delete';
  players: PlayerRow[];
} | null;

export type BowlerCategory = 'graded' | 'open' | 'unclassified';

export type PlayerProfileInput = {
  average: number | null;
  gender: string | null;
};
