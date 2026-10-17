import {
  Card,
  CardContent
} from '../../components/card';
import { Badge } from '../../components/badge';
import { faqs } from '../../utils/constants/landing';
import {
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface FAQProps {
  openFaq: number | null;
  setOpenFaq: (value: number | null) => void;
}

export default function FAQ({ openFaq, setOpenFaq }: FAQProps) {
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
            key={faq.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 }}
          >
            <Card className="glass border-border/50 transition-all duration-200 hover:border-primary/30">
              <CardContent className="p-0 [&:last-child]:pb-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>

                  {openFaq === index ? (
                    <ChevronUp
                      aria-hidden="true"
                      className="h-4 w-4 text-primary flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground flex-shrink-0"
                    />
                  )}
                </button>

                {openFaq === index && (
                  <motion.div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-label={faq.question}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
