export const HISTORY_LABELS: Record<string, string> = {
  average: 'Average',
  men_handicap: "Men's handicap",
  women_handicap: "Women's handicap",
  men_max_handicap: "Men's maximum handicap",
  women_max_handicap: "Women's maximum handicap",
  men_maximum: "Men's maximum handicap",
  ladies_maximum: "Women's maximum handicap",
  enable_handicap: 'Handicap enabled',
  calculation_method: 'Calculation method',
  base_average: 'Base average',
  handicap_percentage: 'Handicap percentage',
  games_for_average: 'Games to establish average',
  round_handicap: 'Round to whole pin',
  promote_handicap: 'Promoted bowler rule',
  league_id: 'League ID',
  id: 'Record ID',
  created_at: 'Created at',
  updated_at: 'Updated at',
};

export type SortField = 'average' | 'men_handicap' | 'women_handicap';
export type SortDirection = 'asc' | 'desc';
export type RangeFilters = {
  averageMin: string;
  averageMax: string;
  menMin: string;
  menMax: string;
  womenMin: string;
  womenMax: string;
};

export const emptyRanges: RangeFilters = {
  averageMin: '',
  averageMax: '',
  menMin: '',
  menMax: '',
  womenMin: '',
  womenMax: '',
};
