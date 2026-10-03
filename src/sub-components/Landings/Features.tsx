import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/card';
import { motion } from 'motion/react';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { features } from '../../utils/constants';

interface FeaturesProps {
  hoveredFeature: number | null;
  setHoveredFeature: (value: number | null) => void;
  onLearnMore: () => void;
}

export default function Features({
  hoveredFeature,
  setHoveredFeature,
  onLearnMore,
}: FeaturesProps) {
  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4">
          <Sparkles className="h-3 w-3" />
          Powerful Features
        </Badge>

        <h2 className="text-4xl font-bold mb-4">
          Everything You Need to
          <span className="gradient-text"> Dominate the Lanes</span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          From amateur leagues to professional tournaments, our comprehensive
          suite of tools helps you manage every aspect of your bowling league.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <Card
                className={`h-full border-border/50 glass transition-all duration-300 ${
                  hoveredFeature === index
                    ? 'scale-105 shadow-lg shadow-primary/20'
                    : ''
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="relative w-fit">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {hoveredFeature === index && (
                      <div
                        className={`absolute inset-0 blur-xl bg-gradient-to-br ${feature.color} opacity-50 rounded-xl`}
                      />
                    )}
                  </div>

                  <h3 className="text-xl font-bold">{feature.title}</h3>

                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <Button
          size="lg"
          variant="outline"
          className="gap-2 glass"
          onClick={onLearnMore}
        >
          <BookOpen className="h-5 w-5" />
          Explore All Features in Detail
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </section>
  );
}
