import {
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Card,
  CardContent
} from '../components/card';
import { motion } from 'motion/react';
import { faqs } from '../utils/constants';
import { Badge } from '../components/badge';
import { useCustomHook } from '../utils/hooks';

export function FaqSection() {
  const {
    openFaq,
    setOpenFaq
  } = useCustomHook();

  return (
    <section className="relative z-10 container mx-auto px-4 py-20 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4">
          <Sparkles className="h-3 w-3" />
          FAQ
        </Badge>
        <h2 className="text-4xl font-bold">
          Common
          <span className="gradient-text"> Questions</span>
        </h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 }}
          >
            <Card
              className="glass border-border/50 cursor-pointer transition-all duration-200 hover:border-primary/30"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{faq.question}</h3>
                  {openFaq === index
                    ? <ChevronUp className="h-4 w-4 text-primary flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
                </div>
                {openFaq === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 text-muted-foreground leading-relaxed text-sm"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
