import { Trophy, LogOut } from 'lucide-react';
import { Button } from '../../components/button';

interface HeaderProps {
  onBackToLanding?: () => void;
  onLogout: () => void;
}

export default function Header({ onBackToLanding, onLogout }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-border/50 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            aria-label="Go to Strike Manager home page"
            className="flex items-center gap-3 text-left"
          >
            <div className="relative">
              <Trophy className="h-7 w-7 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/50 rounded-full" />
            </div>

            <div>
              <h1 className="text-xl font-bold gradient-text">
                Strike Manager
              </h1>

              <p className="text-xs text-muted-foreground">
                Professional Bowling League System
              </p>
            </div>
          </button>

          <Button
            variant="outline"
            onClick={onLogout}
            className="gap-2 text-muted-foreground hover:text-foreground glass border-border/50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
