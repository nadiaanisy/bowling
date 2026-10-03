import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { featureDetails } from '../../utils/constants';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export default function Features() {
  return (
    <section className="relative z-10 container mx-auto px-4 py-10 space-y-32">
      {featureDetails.map((feature, index) => {
        const Icon = feature.icon;
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className={`grid lg:grid-cols-2 gap-12 items-center ${
              isEven ? '' : 'lg:[&>*:first-child]:order-2'
            }`}
          >
            {/* Text side */}
            <div className="space-y-6">
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color}`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-primary/80 mb-1">
                  {feature.subtitle}
                </p>

                <h2 className="text-3xl font-bold">{feature.title}</h2>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-3">
                {feature.bullets.map((bullet, bulletIndex) => (
                  <motion.li
                    key={bulletIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: bulletIndex * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />

                    <span className="text-muted-foreground">{bullet}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Image side */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 group">
              <ImageWithFallback
                src={feature.image}
                alt={feature.title}
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.color} text-white text-sm font-medium shadow-lg`}
                >
                  <Icon className="h-4 w-4" />
                  {feature.title}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
