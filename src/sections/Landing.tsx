import LearnMore from './LearnMore';
import { useCustomHook } from '../utils/hooks';
import CTA from '../sub-components/Landings/CTA';
import Hero from '../sub-components/Landings/Hero';
import Header from '../sub-components/Landings/Header';
import Footer from '../sub-components/Landings/Footer';
import Features from '../sub-components/Landings/Features';
import WhyChooseUs from '../sub-components/Landings/WhyChooseUs';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const {
    hoveredFeature,
    setHoveredFeature,
    showLearnMore,
    setShowLearnMore,
  } = useCustomHook();

  if (showLearnMore) {
    return (
      <LearnMore
        onBack={() => setShowLearnMore(false)}
        onGetStarted={onGetStarted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <Header onGetStarted={onGetStarted} />

      <Hero
        onGetStarted={onGetStarted}
        onLearnMore={() => setShowLearnMore(true)}
      />

      <Features
        hoveredFeature={hoveredFeature}
        setHoveredFeature={setHoveredFeature}
        onLearnMore={() => setShowLearnMore(true)}
      />

      <WhyChooseUs onGetStarted={onGetStarted} />

      <CTA onGetStarted={onGetStarted} />

      <Footer />
    </div>
  );
}