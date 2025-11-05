import {
  Trophy,
  LogOut,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import {
  BowlingProvider,
  useCustomHook
} from './components/misc';

/* --- Sections --- */
import Login from './components/sections/Login';
import Teams from './components/sections/Teams';
import Scores from './components/sections/Scores';
import Forecast from './components/sections/Forecast';
import Dashboard from './components/sections/Dashboard';
import Timetable from './components/sections/Timetable';
import Statistics from './components/sections/Statistics';
import LeagueSelection from './components/sections/LeagueSelection';

/* --- UI --- */
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sooner';

/* --- Data --- */
import { menuItems } from './components/constant';

function AppContent() {
  const {
    isAuthenticated,
    logout,
    selectedLeagueName,
    currentPage,
    mobileMenuOpen,
    selectLeague,
    selectedLeague,
    setCurrentPage,
    setMobileMenuOpen,
    changeLeague
  } = useCustomHook();

  /* --- Auth Check --- */
  if (!isAuthenticated) {
    return <Login />;
  }

  if (!selectedLeague) {
    return <LeagueSelection />;
  } 

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'teams':
        return <Teams />;
      case 'timetable':
        return <Timetable />;
      case 'scores':
        return <Scores />;
      case 'statistics':
        return <Statistics />;
      case 'forecast':
        return <Forecast />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6" />
              <div>
                <h1 className="text-xl">My Bowling League Manager</h1>
                <p className="text-sm text-muted-foreground">{selectedLeagueName}</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
              <Button variant="outline" onClick={() => changeLeague(null as any)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change League
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
              <Button variant="outline" onClick={() => {
                changeLeague(null as any);
                setMobileMenuOpen(false);
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change League
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BowlingProvider>
      <Toaster />
      <AppContent />
    </BowlingProvider>
  );
}
