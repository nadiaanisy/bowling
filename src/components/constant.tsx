import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Swords,
  Trophy,
  Users
} from 'lucide-react';

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'scores', label: 'Scores', icon: Trophy },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'forecast', label: 'Forecast', icon: Swords },
];

export const table = {
  user: 'user',
  teams: 'teams',
  blocks: 'blocks',
  players: 'players',
  leagues: 'leagues',
  timetable: 'timetable',
  weeklyScore: 'weekly_scores'
};

export const sql_query = {
  all: '*'
}
