import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent
} from '../../components/card';
import { motion } from 'motion/react';
import { Button } from '../../components/button';

interface CTAProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export default function CTA({
  onBack,
  onGetStarted,
}: CTAProps) {
  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-border/50 glass overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />

            <CardContent className="relative p-12 text-center space-y-6">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-2">
                <Trophy className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-4xl font-bold">
                Ready to <span className="gradient-text">Strike</span>?
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                You now know what Strike Manager can do. Log in and take
                control of your league today.
              </p>

              <div className="flex flex-wrap gap-4 justify-center pt-2">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/50"
                >
                  <Zap className="h-5 w-5" />
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={onBack}
                  className="gap-2 glass"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}