import type { NavigationGroup } from '../type';
import {
  Activity,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  SlidersHorizontal,
  Trophy,
  TrendingUp,
  UserRound,
  UsersRound,
  Settings2,
} from 'lucide-react';

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        available: true,
      },
    ],
  },
  {
    label: 'League',
    items: [
      {
        id: 'hdc',
        label: 'Handicap',
        icon: SlidersHorizontal,
        available: true,
      },
      { id: 'teams', label: 'Teams', icon: UsersRound },
      { id: 'players', label: 'Players', icon: UserRound },
      { id: 'timetable', label: 'Timetable', icon: CalendarDays },
      { id: 'scores', label: 'Scores', icon: Trophy },
      { id: 'settings', label: 'Settings', icon: Settings2 },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'statistics', label: 'Statistics', icon: BarChart3 },
      { id: 'analytics', label: 'Analytics', icon: Activity },
      { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    ],
  },
];
