import {
  Calculator,
  Calendar,
  LayoutDashboard,
  Users
} from 'lucide-react';

export const menuItems: {
  id: string;
  label: string;
  icon: any;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hdc', label: 'Handicap', icon: Calculator },
  // { id: 'teams', label: 'Teams', icon: Users },
  //   { id: 'players', label: 'Players', icon: UserCircle },
  // { id: 'timetable', label: 'Timetable', icon: Calendar },
  //   { id: 'scores', label: 'Scores', icon: Trophy },
  //   //   // { id: "statistics", label: "Statistics", icon: BarChart3 },
  //   //   // { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  //   //   // { id: 'forecast', label: 'Forecast', icon: Swords },
];

export const DEFAULT_MATCHES_PER_WEEK = 16;
