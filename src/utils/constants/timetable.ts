import type {
  Lane,
  LeagueBlock,
  LeagueTeam,
  MatchesByBlock,
} from '../interfaces';

export const TIMETABLE_INITIAL_FILTERS = {
  week: 'all',
  team: 'all',
  status: 'all',
} as const;

export const TIMETABLE_INITIAL_MATCH_FORM = {
  week: '',
  scheduledDate: '',
  scheduleType: 'regular' as const,
  team1: '',
  team2: '',
  lane: '',
};

export const TIMETABLE_SCHEDULE_TYPES = [
  { value: 'regular', label: 'Regular session' },
  { value: 'pre_bowl', label: 'Pre-bowl' },
  { value: 'post_bowl', label: 'Post-bowl' },
] as const;

export const TIMETABLE_EMPTY_BLOCKS: LeagueBlock[] = [];
export const TIMETABLE_EMPTY_TEAMS: LeagueTeam[] = [];
export const TIMETABLE_EMPTY_LANES: Lane[] = [];
export const TIMETABLE_EMPTY_MATCHES: MatchesByBlock = {};
export const TIMETABLE_EMPTY_USED_RESOURCES: string[] = [];
export const TIMETABLE_INITIAL_SELECTED_IDS: Array<string | number> = [];
export const TIMETABLE_INITIAL_BLOCK_NUMBER: number | null = null;
export const TIMETABLE_INITIAL_LOAD_ERROR: string | null = null;
export const TIMETABLE_INITIAL_DELETE_DIALOG_MATCH_ID: string | number | null =
  null;
export const TIMETABLE_INITIAL_EDITING_MATCH_ID: string | number | null = null;
export const TIMETABLE_INITIAL_SESSION_DATE = '';
export const TIMETABLE_INITIAL_SAVING_SESSION_DATE = false;
export const TIMETABLE_INITIAL_CREATING_MATCH = false;
export const TIMETABLE_INITIAL_DELETING_MATCH = false;
