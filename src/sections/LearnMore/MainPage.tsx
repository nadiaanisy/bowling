import CTA from './CTA';
import FAQ from './FAQ';
import Hero from './Hero';
import Footer from './Footer';
import Header from './Header';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Capabilities from './Capabilities';
import { useCustomHook } from '../../utils/hooks';

interface LearnMoreProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export default function LearnMore({ onBack, onGetStarted }: LearnMoreProps) {
  const { openFaq, setOpenFaq } = useCustomHook();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 overflow-hidden">
      {/* Animated background */}
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

      <Header onBack={onBack} onGetStarted={onGetStarted} />

      <Hero />

      <Features />

      <HowItWorks />

      <Capabilities />

      <FAQ openFaq={openFaq} setOpenFaq={setOpenFaq} />

      <CTA onBack={onBack} onGetStarted={onGetStarted} />

      <Footer />
    </div>
  );
}
