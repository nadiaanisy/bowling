import {
  BarChart3,
  Calendar,
  RefreshCw,
  Shuffle,
  Star,
  Trophy,
  UserCircle,
  Users,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent
} from '../../components/card';
import { motion } from 'motion/react';
import { Badge } from '../../components/badge';

const capabilities = [
  {
    value: '3+',
    label: 'Leagues',
    sublabel: 'Sunray · Sunshine · Valuefest · Many More',
    icon: Trophy,
    color: 'from-purple-500 to-pink-500',
  },
  {
    value: '10+',
    label: 'Teams / League',
    sublabel: 'Full roster management',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    value: '10+',
    label: 'Weeks / Block',
    sublabel: 'Multi-block seasons',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
  },
  {
    value: '∞',
    label: 'Players Tracked',
    sublabel: 'No limits on roster size',
    icon: UserCircle,
    color: 'from-orange-500 to-red-500',
  },
  {
    value: '5',
    label: 'Forecast Factors',
    sublabel: 'AI scoring dimensions',
    icon: Zap,
    color: 'from-violet-500 to-purple-500',
  },
  {
    value: '6+',
    label: 'Chart Types',
    sublabel: 'Interactive analytics',
    icon: BarChart3,
    color: 'from-pink-500 to-rose-500',
  },
  {
    value: '100%',
    label: 'Auto Calculations',
    sublabel: 'Averages & handicaps',
    icon: RefreshCw,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    value: '↗',
    label: 'Transfer History',
    sublabel: 'Full career preservation',
    icon: Shuffle,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function Capabilities() {
  return (
    <section className="relative z-10 container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4">
          <Star className="h-3 w-3" />
          By the Numbers
        </Badge>

        <h2 className="text-4xl font-bold">
          Built for Scale,
          <span className="gradient-text">
            {' '}Designed for Simplicity
          </span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {capabilities.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="glass border-border/50 p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200 cursor-default">
                <CardContent className="p-0 space-y-3">
                  <div
                    className={`mx-auto w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <div className="text-3xl font-bold gradient-text">
                    {stat.value}
                  </div>

                  <div>
                    <div className="font-semibold text-sm">
                      {stat.label}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {stat.sublabel}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}