import { Card, CardContent } from '../../components/card';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '../../components/badge';
import { howItWorks } from '../../utils/constants';

export default function HowItWorks() {
  return (
    <section className="relative z-10 container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4">
          <RefreshCw className="h-3 w-3" />
          How It Works
        </Badge>

        <h2 className="text-4xl font-bold mb-4">
          Up and Running in
          <span className="gradient-text"> Five Steps</span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          From first login to full league management — the workflow is designed
          to get out of your way.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-4">
        {howItWorks.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}

              <Card className="glass border-border/50 text-center p-6 space-y-4 relative z-10 h-full">
                <CardContent className="p-0 space-y-4">
                  <div className="text-xs font-mono font-bold text-primary/60 tracking-widest">
                    {step.step}
                  </div>

                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-border/50 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="font-bold">{step.title}</h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
