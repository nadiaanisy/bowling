import { Trophy } from 'lucide-react';

export default function Footer() {
  return (
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
  );
}
