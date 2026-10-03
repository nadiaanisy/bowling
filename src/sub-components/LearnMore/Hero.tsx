import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { Badge } from '../../components/badge';

export default function Hero() {
  return (
    <section className="relative z-10 container mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        <Badge className="gap-2 bg-primary/20 text-primary border-primary/30">
          <BookOpen className="h-3 w-3" />
          Complete Feature Guide
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Everything Strike Manager
          <span className="block gradient-text">Can Do for You</span>
        </h1>

        <p className="text-xl text-muted-foreground">
          A deep dive into every feature — from score entry to AI-powered
          forecasting. Built for league secretaries who want less spreadsheet
          work and more time bowling.
        </p>
      </motion.div>
    </section>
  );
}
