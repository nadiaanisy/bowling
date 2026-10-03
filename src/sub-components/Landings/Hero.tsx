import { ArrowRight, Award, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { stats } from '../../utils/constants';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { ImageWithFallback } from '../../components/ImageWithFallback';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export default function Hero({ onGetStarted, onLearnMore }: HeroProps) {
  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <Badge className="gap-2 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="h-3 w-3" />
            AI-Powered League Management
          </Badge>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Master Your
              <span className="block gradient-text">Bowling League</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              The ultimate management system for bowling leagues. Track players,
              analyze performance, and forecast matches with intelligent AI
              recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/50"
            >
              <Zap className="h-5 w-5" />
              Launch Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 glass"
              onClick={onLearnMore}
            >
              <Award className="h-5 w-5" />
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1650313525165-40c8132c0ae0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3dsaW5nJTIwYWxsZXklMjBwaW5zJTIwbmVvbiUyMG1vZGVybnxlbnwxfHx8fDE3NzI0NDg0NDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Modern bowling alley"
              className="w-full h-auto"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-6 left-6 glass rounded-xl p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">
                    Average Improvement
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    +24 pins
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
