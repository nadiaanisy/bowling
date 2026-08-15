import {
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent
} from '../components/card';
import {
  featureDetails,
  howItWorks
} from '../utils/constants';
import { motion } from 'motion/react';
import { FaqSection } from './FaqSection';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface LearnMorePageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export function LearnMorePage({ onBack, onGetStarted }: LearnMorePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="relative z-10 border-b border-border/50 glass sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Trophy className="h-6 w-6 text-primary" />
                  <div className="absolute inset-0 blur-lg bg-primary/50 rounded-full" />
                </div>
                <span className="font-bold gradient-text hidden sm:inline">Strike Manager</span>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs hidden sm:inline-flex">
                <BookOpen className="h-3 w-3 mr-1" />
                Learn More
              </Badge>
            </div>
            <Button onClick={onGetStarted} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30">
              <Zap className="h-4 w-4" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 max-w-3xl mx-auto">
          <Badge className="gap-2 bg-primary/20 text-primary border-primary/30">
            <BookOpen className="h-3 w-3" />
            Complete Feature Guide
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Everything Strike Manager
            <span className="block gradient-text">Can Do for You</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            A deep dive into every feature — from score entry to AI-powered forecasting.
            Built for league secretaries who want less spreadsheet work and more time bowling.
          </p>
        </motion.div>
      </section>

      <section className="relative z-10 container mx-auto px-4 py-10 space-y-32">
        {featureDetails.map((feature, index) => {
          const Icon = feature.icon;
          const isEven = index % 2 === 0;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:[&>*:first-child]:order-2'}`}>
              <div className="space-y-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color}`}><Icon className="h-7 w-7 text-white" /></div>
                <div>
                  <p className="text-sm font-medium text-primary/80 mb-1">{feature.subtitle}</p>
                  <h2 className="text-3xl font-bold">{feature.title}</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, bulletIndex) => (
                    <motion.li key={bulletIndex} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: bulletIndex * 0.08 }} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 group">
                <ImageWithFallback src={feature.image} alt={feature.title} className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.color} text-white text-sm font-medium shadow-lg`}>
                    <Icon className="h-4 w-4" />
                    {feature.title}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="relative z-10 container mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4"><RefreshCw className="h-3 w-3" />How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4">Up and Running in<span className="gradient-text"> Five Steps</span></h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From first login to full league management — the workflow is designed to get out of your way.</p>
        </motion.div>
        <div className="grid md:grid-cols-5 gap-4">
          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative">
                {index < howItWorks.length - 1 && <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-border to-transparent z-0" />}
                <Card className="glass border-border/50 text-center p-6 space-y-4 relative z-10 h-full">
                  <CardContent className="p-0 space-y-4">
                    <div className="text-xs font-mono font-bold text-primary/60 tracking-widest">{step.step}</div>
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-border/50 flex items-center justify-center"><Icon className="h-6 w-6 text-primary" /></div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <FaqSection />

      <footer className="relative z-10 border-t border-border/50 glass mt-20">
        <div className="container mx-auto px-4 py-8"><div className="flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-3"><Trophy className="h-6 w-6 text-primary" /><span className="font-bold gradient-text">Strike Manager</span></div><p className="text-sm text-muted-foreground">© 2026 Strike Manager. Perfect game, perfect management.</p></div></div>
      </footer>
    </div>
  );
}
