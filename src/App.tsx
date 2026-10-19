// // import Players from '../src2/sections/Players';
// import Teams from '../src/sections/Teams';
// // import Scores from '../src/sections/Scores';
// import Handicap from '../src/sections/Handicap';
// import Timetable from '../src/sections/Timetable';
// // // // import Forecast from "./sections/Forecast";
// // // // import Timetable from "./sections/Timetable";
// // // // import Statistics from "./sections/Statistics";

import { UseHook } from './utils/hooks';
import { Provider } from './utils/provider';
import { Button } from './components/button';
import { Toaster } from './components/sooner';
import Login from './sections/Login/Login';
import { menuItems } from './utils/constants/others';
import Dashboard from './sections/Dashboard/MainPage';
import Landing from './sections/Landings/L-MainPage';
import LeagueSelection from './sections/LeagueSelection/MainPage';
import {
  ArrowLeft,
  LogOut,
  Menu,
  Trophy,
  X
} from 'lucide-react';

function AppContent() {
  const {
    isAuthenticated,
    sessionExpired,
    logout,
    selectedLeagueName,
    currentPage,
    mobileMenuOpen,
    selectedLeague,
    showLanding,
    setCurrentPage,
    setMobileMenuOpen,
    setShowLanding,
    changeLeague,
  } = UseHook();

  const handleLogout = () => {
    logout();
    setShowLanding(true);
  };

  /* --- Public entry flow --- */
  if (!isAuthenticated && !sessionExpired && showLanding) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }

  /* --- Auth Check --- */
  if (!isAuthenticated) {
    return <Login onBack={() => setShowLanding(true)} />;
  }

  if (!selectedLeague) {
    return (
      <LeagueSelection
        onBackToLanding={() => setShowLanding(true)}
        onLogout={handleLogout}
        onLeagueOpened={() => setCurrentPage('dashboard')}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
        // case 'hdc':
        //   return <Handicap leagueId={selectedLeague} />;
        // case 'teams':
        //   return <Teams />;
        // case "players":
        //   return <Players />;
        // case 'timetable':
        //   return <Timetable />;
        // case "scores":
        //   return <Scores />;

      // case "statistics":
      //   return <Statistics />;
      // case "forecast":
      //   return <Forecast />;
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
                <p className="text-sm text-muted-foreground">
                  {selectedLeagueName}
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
              <Button variant="outline" onClick={() => changeLeague()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change League
              </Button>
              <Button variant="outline" onClick={handleLogout}>
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
              <Button
                variant="outline"
                onClick={() => {
                  changeLeague();
                  setMobileMenuOpen(false);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change League
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <Provider>
      <Toaster />
      <AppContent />
    </Provider>
  );
}
