import { Shield } from 'lucide-react';

/* Defines the benefits displayed on the landing page. */
export const benefits: [] = [
  // 'Automated handicap calculations',
  // 'Multi-block season tracking',
  // 'Player transfer management',
  // 'AI-powered match predictions',
  // 'Comprehensive performance analytics',
  // 'Easy score entry and validation',
];

/* Defines the main features displayed on the landing page. */
export const features: {
  icon: any;
  title: string;
  description: string;
  color: any;
}[] = [
  //   {
  //     icon: Users,
  //     title: 'Team Management',
  //     description:
  //       'Effortlessly manage multiple leagues with multiple teams each. Track players, <s>substitutes</s>, and team rosters.',
  //     color: 'from-purple-500 to-pink-500',
  //   },
  //   // {
  //   //   icon: Calendar,
  //   //   title: 'Smart Scheduling',
  //   //   description:
  //   //     'Automated timetable generation for multiple-week blocks. Never miss a match with intelligent scheduling.',
  //   //   color: 'from-cyan-500 to-blue-500',
  //   // },
  //   // {
  //   //   icon: BarChart3,
  //   //   title: 'Advanced Analytics',
  //   //   description:
  //   //     'Track player performance with detailed charts showing improvements in averages, handicaps, and consistency.',
  //   //   color: 'from-green-500 to-emerald-500',
  //   // },
  //   // {
  //   //   icon: Zap,
  //   //   title: 'AI-Powered Forecasts',
  //   //   description:
  //   //     'Get intelligent lineup recommendations based on form, matchups, and opponent analysis.',
  //   //   color: 'from-orange-500 to-red-500',
  //   // },
  //   // {
  //   //   icon: Trophy,
  //   //   title: 'Live Score Tracking',
  //   //   description:
  //   //     'Real-time score input with automatic calculations for averages, handicaps, and statistics.',
  //   //   color: 'from-violet-500 to-purple-500',
  //   // },
  //   // {
  //   //   icon: Target,
  //   //   title: 'Performance Insights',
  //   //   description:
  //   //     'Comprehensive statistics dashboard with trends, comparisons, and career tracking.',
  //   //   color: 'from-pink-500 to-rose-500',
  //   // },
];

/* Defines the statistics displayed on the landing page. */
export const stats: {
  label: any;
  value: any;
}[] = [
  //   // { label: 'Leagues Supported', value: '10+' },
  //   // { label: 'Teams per League', value: '10+' },
  //   // { label: 'Week Blocks', value: '1–10' },
  //   // { label: 'Players Tracked', value: '∞' },
];

/* Defines detailed descriptions and bullet points for each feature. */
export const featureDetails: {
  icon: any;
  color: any;
  title?: string;
  subtitle?: string;
  description?: string;
  bullets: string[];
  image: any;
}[] = [
  //   // {
  //   //   icon: Users,
  //   //   color: 'from-purple-500 to-pink-500',
  //   //   title: 'Team & Player Management',
  //   //   subtitle: 'Full roster control at your fingertips',
  //   //   description:
  //   //     'Manage up to multiple teams per league with complete player profiles. Track substitutes with distinctive guest badges, manage player transfers while preserving full history, and monitor attendance with visual indicators across every session.',
  //   //   bullets: [
  //   //     'Create and manage teams across multiple leagues',
  //   //     'Track regular players, substitutes, and guest bowlers',
  //   //     'Player transfer system with complete history preservation',
  //   //     'Attendance tracking with per-week visual indicators',
  //   //     'Detailed player profiles with career statistics',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1504639725590-34d0984388bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
  //   // {
  //   //   icon: Calendar,
  //   //   color: 'from-cyan-500 to-blue-500',
  //   //   title: 'Smart Timetable Scheduling',
  //   //   subtitle: 'Automated fixture generation for entire seasons',
  //   //   description:
  //   //     'Generate complete multiple-week schedules automatically. Support multiple blocks per season with lane assignments, and always know which teams face each other — week by week, block by block.',
  //   //   bullets: [
  //   //     'Auto-generated fixtures for full multiple-week blocks',
  //   //     'Multiple block seasons tracked separately',
  //   //     'Lane assignment management',
  //   //     'Head-to-head match history lookup',
  //   //     'Weekly schedule overview at a glance',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1506784365847-bbad939e9335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
  //   // {
  //   //   icon: Trophy,
  //   //   color: 'from-violet-500 to-purple-500',
  //   //   title: 'Live Score Entry & Calculations',
  //   //   subtitle: 'Input scores once — everything else is automatic',
  //   //   description:
  //   //     'Enter game scores and the system handles all the math. Averages update automatically, handicaps recalculate each week, and league standings refresh in real time after every entry.',
  //   //   bullets: [
  //   //     'Three-game series input with instant totals',
  //   //     'Automatic average and handicap calculations',
  //   //     'Real-time league standings updates',
  //   //     'Historical score lookup by week and player',
  //   //     'Validation to catch entry errors before saving',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
  //   // {
  //   //   icon: BarChart3,
  //   //   color: 'from-green-500 to-emerald-500',
  //   //   title: 'Advanced Analytics',
  //   //   subtitle: 'Visualize every dimension of performance',
  //   //   description:
  //   //     'Dive deep into player and team performance with interactive charts. Track average progression, handicap trends, high game history, and series totals over an entire season or block.',
  //   //   bullets: [
  //   //     'Average progression charts over time',
  //   //     'Handicap improvement tracking',
  //   //     'High game and series visualization',
  //   //     'Side-by-side player comparison',
  //   //     'Filterable by block, team, or time range',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
  //   // {
  //   //   icon: Zap,
  //   //   color: 'from-orange-500 to-red-500',
  //   //   title: 'AI-Powered Forecasting',
  //   //   subtitle: 'Data-driven lineup recommendations',
  //   //   description:
  //   //     "The Forecast engine analyzes each player's recent form, long-term average, consistency score, experience, and high-game potential to produce an optimal team lineup with clear written reasoning for every pick.",
  //   //   bullets: [
  //   //     'Multi-factor performance scoring algorithm',
  //   //     'Recent form weighting (last 4 weeks)',
  //   //     'Consistency and experience modifiers',
  //   //     'Detailed written reasoning per player',
  //   //     'Opponent-aware match predictions',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
  //   // {
  //   //   icon: Target,
  //   //   color: 'from-pink-500 to-rose-500',
  //   //   title: 'Performance Statistics',
  //   //   subtitle: 'Complete career and season summaries',
  //   //   description:
  //   //     'A full statistics hub shows season-level summaries, current standings, top performers, and head-to-head records — everything a league secretary needs to run a professional operation.',
  //   //   bullets: [
  //   //     'Season-high game and series leaderboards',
  //   //     'Current standings with points breakdown',
  //   //     'Per-team win/loss/draw records',
  //   //     'Player career bests tracking',
  //   //     'Week-by-week summary tables',
  //   //   ],
  //   //   image:
  //   //     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  //   // },
];

/* Defines the step-by-step process of using the application. */
export const howItWorks: {
  step: string;
  icon: any;
  title: string;
  description: string;
}[] = [
  {
    step: '01',
    icon: Shield,
    title: 'Log In',
    description:
      'Access the system with your account. A single secure entry point protects all your data.',
  },
  //   // {
  //   //   step: '02',
  //   //   icon: BookOpen,
  //   //   title: 'Select Your League',
  //   //   description:
  //   //     'Choose which of your leagues to manage. Switch between them anytime.',
  //   // },
  //   // {
  //   //   step: '03',
  //   //   icon: ClipboardList,
  //   //   title: 'Set Up Your Season',
  //   //   description:
  //   //     'Define how many blocks your season runs, generate timetables, and import your team rosters.',
  //   // },
  //   // {
  //   //   step: '04',
  //   //   icon: Activity,
  //   //   title: 'Enter Weekly Scores',
  //   //   description:
  //   //     'After each session, enter game scores. Averages, handicaps, and standings update automatically.',
  //   // },
  //   // {
  //   //   step: '05',
  //   //   icon: TrendingUp,
  //   //   title: 'Analyse & Forecast',
  //   //   description:
  //   //     'Use analytics charts and AI forecasts to understand performance trends and plan upcoming matches.',
  //   // },
];

/* Defines frequently asked questions and their answers. */
export const faqs: {
  question: string;
  answer: string;
}[] = [
  //   // {
  //   //   question: 'How many leagues can I manage at once?',
  //   //   answer:
  //   //     'You can create and manage multiple leagues from the league selection screen — each with up to multiple teams. You switch between leagues from the league selection screen after login.',
  //   // },
  //   // {
  //   //   question: 'How are handicaps calculated?',
  //   //   answer:
  //   //     "Handicaps are calculated automatically from each player's current rolling average using the standard league formula. Every time you enter a new week's scores, all handicaps update without any manual input.",
  //   // },
  //   // {
  //   //   question: 'Can I track players who move between teams?',
  //   //   answer:
  //   //     'Yes. The transfer system lets you move a player to a new team while preserving all their historical statistics from their previous team. Their career record remains complete and visible in their player profile.',
  //   // },
  //   // {
  //   //   question: "What's the difference between a substitute and a guest?",
  //   //   answer:
  //   //     'Substitutes are registered league players filling in for an absent team member. Guests are non-registered bowlers playing one-off matches. Both appear with distinctive badges in the score entry and player lists.',
  //   // },
  //   // {
  //   //   question: 'Can I run multiple blocks within one season?',
  //   //   answer:
  //   //     'Absolutely. You define the number of blocks when setting up a league. Each block runs its own multiple-week schedule and standings are tracked separately, so you can identify which block a performance belongs to at any time.',
  //   // },
  //   // {
  //   //   question: 'How does the AI Forecast work?',
  //   //   answer:
  //   //     'The forecast algorithm scores each eligible player across five dimensions: recent form (last 4 weeks weighted), season average, consistency (standard deviation of scores), experience (weeks played), and high-game potential. It then ranks players and provides written justification for the recommended lineup.',
  //   // },
];

/* Defines the key capabilities and highlights of the application. */
export const capabilities: {
  value: string;
  label: string;
  sublabel: string;
  icon: any;
  color: any;
}[] = [
  //   // {
  //   //   value: '3+',
  //   //   label: 'Leagues',
  //   //   sublabel: 'Sunray · Sunshine · Valuefest · Many More',
  //   //   icon: Trophy,
  //   //   color: 'from-purple-500 to-pink-500',
  //   // },
  //   // {
  //   //   value: '10+',
  //   //   label: 'Teams / League',
  //   //   sublabel: 'Full roster management',
  //   //   icon: Users,
  //   //   color: 'from-cyan-500 to-blue-500',
  //   // },
  //   // {
  //   //   value: '10+',
  //   //   label: 'Weeks / Block',
  //   //   sublabel: 'Multi-block seasons',
  //   //   icon: Calendar,
  //   //   color: 'from-green-500 to-emerald-500',
  //   // },
  //   // {
  //   //   value: '∞',
  //   //   label: 'Players Tracked',
  //   //   sublabel: 'No limits on roster size',
  //   //   icon: UserCircle,
  //   //   color: 'from-orange-500 to-red-500',
  //   // },
  //   // {
  //   //   value: '5',
  //   //   label: 'Forecast Factors',
  //   //   sublabel: 'AI scoring dimensions',
  //   //   icon: Zap,
  //   //   color: 'from-violet-500 to-purple-500',
  //   // },
  //   // {
  //   //   value: '6+',
  //   //   label: 'Chart Types',
  //   //   sublabel: 'Interactive analytics',
  //   //   icon: BarChart3,
  //   //   color: 'from-pink-500 to-rose-500',
  //   // },
  //   // {
  //   //   value: '100%',
  //   //   label: 'Auto Calculations',
  //   //   sublabel: 'Averages & handicaps',
  //   //   icon: RefreshCw,
  //   //   color: 'from-teal-500 to-cyan-500',
  //   // },
  //   // {
  //   //   value: '↗',
  //   //   label: 'Transfer History',
  //   //   sublabel: 'Full career preservation',
  //   //   icon: Shuffle,
  //   //   color: 'from-amber-500 to-orange-500',
  //   // },
];
