import {
  ArrowRight,
  Trophy
} from 'lucide-react';
import { Button } from '../../components/button';

interface HeaderProps {
  onGetStarted: () => void;
}

export default function Header({
  onGetStarted,
}: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-border/50 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Trophy className="h-8 w-8 text-primary animate-glow" />
              <div className="absolute inset-0 blur-lg bg-primary/50 rounded-full" />
            </div>

            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Strike Manager
              </h1>
              <p className="text-xs text-muted-foreground">
                Professional Bowling League System
              </p>
            </div>
          </div>

          <Button
            onClick={onGetStarted}
            variant="outline"
            className="gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}