import {
  ArrowRight,
  Award,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { ImageWithFallback } from '../../components/ImageWithFallback';

interface WhyChooseUsProps {
  onGetStarted: () => void;
}

const benefits = [
  'Automated handicap calculations',
  'Multi-block season tracking',
  'Player transfer management',
  'AI-powered match predictions',
  'Comprehensive performance analytics',
  'Easy score entry and validation',
];

export default function WhyChooseUs({
  onGetStarted,
}: WhyChooseUsProps) {
  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1573509078860-0196070b81dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3dsaW5nJTIwc3RyaWtlJTIwY2VsZWJyYXRpb24lMjB0ZWFtJTIwc3BvcnR8ZW58MXx8fHwxNzcyNDQ4NDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Bowling team celebration"
            className="w-full h-auto rounded-2xl shadow-2xl shadow-cyan-500/20"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <Badge className="gap-2 bg-primary/20 text-primary border-primary/30">
            <Award className="h-3 w-3" />
            Why Choose Us
          </Badge>

          <h2 className="text-4xl font-bold">
            Built for Bowlers,
            <span className="block gradient-text">
              By Bowling Enthusiasts
            </span>
          </h2>

          <p className="text-lg text-muted-foreground">
            We understand the unique challenges of managing a bowling
            league. That's why we've created a system that's both powerful
            and intuitive.
          </p>

          <div className="space-y-4">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={onGetStarted}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/50"
          >
            <Zap className="h-5 w-5" />
            Start Managing Your League
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}