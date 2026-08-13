import {
  Trophy,
  Zap,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shuffle,
  Star,
  UserCircle,
  Users,
} from 'lucide-react';
import {
  faqs,
  featureDetails,
  features,
  howItWorks,
  stats
} from '../utils/constants';
import {
  Card,
  CardContent
} from '../components/card';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface LandingProps {
  onGetStarted: () => void;
}

function LearnMorePage({ onBack, onGetStarted }: { onBack: () => void; onGetStarted: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sticky header */}
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
            <Button
              onClick={onGetStarted}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
            >
              <Zap className="h-4 w-4" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
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
            A deep dive into every feature — from score entry to AI-powered forecasting.
            Built for league secretaries who want less spreadsheet work and more time bowling.
          </p>
        </motion.div>
      </section>

      {/* Feature Detail Sections */}
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
              className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:[&>*:first-child]:order-2'}`}
            >
              {/* Text side */}
              <div className="space-y-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary/80 mb-1">{feature.subtitle}</p>
                  <h2 className="text-3xl font-bold">{feature.title}</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, bIndex) => (
                    <motion.li
                      key={bIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: bIndex * 0.08 }}
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

      {/* How It Works */}
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
            From first login to full league management — the workflow is designed to get out of your way.
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
                    <div className="text-xs font-mono font-bold text-primary/60 tracking-widest">{step.step}</div>
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-border/50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Capabilities grid */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="gap-2 bg-primary/20 text-primary border-primary/30 mb-4">
            <Star className="h-3 w-3" />
            By the Numbers
          </Badge>
          <h2 className="text-4xl font-bold">
            Built for Scale,
            <span className="gradient-text"> Designed for Simplicity</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '3+', label: 'Leagues', sublabel: 'Sunray · Sunshine · Valuefest · Many More', icon: Trophy, color: 'from-purple-500 to-pink-500' },
            { value: '10+', label: 'Teams / League', sublabel: 'Full roster management', icon: Users, color: 'from-cyan-500 to-blue-500' },
            { value: '10+', label: 'Weeks / Block', sublabel: 'Multi-block seasons', icon: Calendar, color: 'from-green-500 to-emerald-500' },
            { value: '∞', label: 'Players Tracked', sublabel: 'No limits on roster size', icon: UserCircle, color: 'from-orange-500 to-red-500' },
            { value: '5', label: 'Forecast Factors', sublabel: 'AI scoring dimensions', icon: Zap, color: 'from-violet-500 to-purple-500' },
            { value: '6+', label: 'Chart Types', sublabel: 'Interactive analytics', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
            { value: '100%', label: 'Auto Calculations', sublabel: 'Averages & handicaps', icon: RefreshCw, color: 'from-teal-500 to-cyan-500' },
            { value: '↗', label: 'Transfer History', sublabel: 'Full career preservation', icon: Shuffle, color: 'from-amber-500 to-orange-500' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="glass border-border/50 p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200 cursor-default">
                  <CardContent className="p-0 space-y-3">
                    <div className={`mx-auto w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                    <div>
                      <div className="font-semibold text-sm">{stat.label}</div>
                      <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
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
                  You now know what Strike Manager can do. Log in and take control of your league today.
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
                  <Button size="lg" variant="outline" onClick={onBack} className="gap-2 glass">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 glass">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold gradient-text">Strike Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Strike Manager. Perfect game, perfect management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Landing({ onGetStarted }: LandingProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showLearnMore, setShowLearnMore] = useState(false);

  if (showLearnMore) {
    return <LearnMorePage onBack={() => setShowLearnMore(false)} onGetStarted={onGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="h-8 w-8 text-primary animate-glow" />
                <div className="absolute inset-0 blur-lg bg-primary/50 rounded-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Strike Manager</h1>
                <p className="text-xs text-muted-foreground">Professional Bowling League System</p>
              </div>
            </div>
            <Button onClick={onGetStarted} variant="outline" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
                The ultimate management system for bowling leagues. Track players, analyze performance,
                and forecast matches with intelligent AI recommendations.
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
                onClick={() => setShowLearnMore(true)}
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
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
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
                    <div className="text-sm text-muted-foreground">Average Improvement</div>
                    <div className="text-2xl font-bold text-green-500">+24 pins</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
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
            From amateur leagues to professional tournaments, our comprehensive suite of tools
            helps you manage every aspect of your bowling league.
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
                    hoveredFeature === index ? 'scale-105 shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="relative w-fit">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {hoveredFeature === index && (
                        <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${feature.color} opacity-50 rounded-xl`} />
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
            onClick={() => setShowLearnMore(true)}
          >
            <BookOpen className="h-5 w-5" />
            Explore All Features in Detail
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Why Choose Us */}
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
              <span className="block gradient-text">By Bowling Enthusiasts</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              We understand the unique challenges of managing a bowling league. That's why we've
              created a system that's both powerful and intuitive.
            </p>

            <div className="space-y-4">
              {[
                'Automated handicap calculations',
                'Multi-block season tracking',
                'Player transfer management',
                'AI-powered match predictions',
                'Comprehensive performance analytics',
                'Easy score entry and validation'
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
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

      {/* CTA Section */}
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
                <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                  <Trophy className="h-12 w-12 text-white" />
                </div>

                <h2 className="text-4xl font-bold">
                  Ready to <span className="gradient-text">Strike</span>?
                </h2>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join the revolution in bowling league management. Get started in seconds
                  and experience the future of league organization.
                </p>

                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={onGetStarted}
                    className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/50"
                  >
                    <Zap className="h-5 w-5" />
                    Launch Dashboard Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 glass mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold gradient-text">Strike Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Strike Manager. Perfect game, perfect management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
