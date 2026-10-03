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
import { Card, CardContent } from '../../components/card';
import { motion } from 'motion/react';
import { Badge } from '../../components/badge';
import { capabilities } from '../../utils/constants';

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
          <span className="gradient-text"> Designed for Simplicity</span>
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
                    <div className="font-semibold text-sm">{stat.label}</div>

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
