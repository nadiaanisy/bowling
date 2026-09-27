import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Trophy,
  Zap,
} from 'lucide-react';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';

interface HeaderProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export default function Header({
  onBack,
  onGetStarted,
}: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-border/50 glass sticky top-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-2">
              <div className="relative">
                <Trophy className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/50 rounded-full" />
              </div>

              <span className="font-bold gradient-text hidden sm:inline">
                Strike Manager
              </span>
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
  );
}