import { UseHook } from './utils/hooks';
import { Provider } from './utils/provider';
import { Button } from './components/button';
import { Toaster } from './components/sooner';
import Login from './sections/Login/Login';
import Teams from './sections/Teams/Teams';
import { navigationGroups } from './utils/constants/menu';
import Players from './sections/Players/Players';
import Handicap from './sections/Handicap/Handicap';
import Landing from './sections/Landings/MainPage';
import Dashboard from './sections/Dashboard/MainPage';
import LeagueSelection from './sections/LeagueSelection/MainPage';
import {
ArrowLeft,
LogOut,
Menu,
Settings,
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
    userData,
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
      case 'teams':
        return <Teams />;
      case 'players':
        return <Players />;
      case 'hdc':
        return <Handicap leagueId={selectedLeague} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  const profileName = userData?.user_name || 'League Admin';
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-[#0c0a12] text-foreground lg:flex">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`${mobileMenuOpen ? 'fixed' : 'hidden'} inset-y-0 left-0 z-50 flex w-[270px] shrink-0 flex-col border-r border-violet-300/10 bg-[#100c19] lg:sticky lg:top-0 lg:flex lg:h-screen`}
      >
        <div className="flex h-[72px] items-center gap-3 border-b border-violet-300/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold text-white">
              Strike Manager
            </div>
            <div className="text-[11px] text-slate-400">
              Bowling League System
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-7 overflow-y-auto px-3 py-7"
        >
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300/80">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!item.available}
                      title={item.available ? item.label : 'Coming soon'}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        if (!item.available) return;
                        setCurrentPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? 'bg-gradient-to-r from-violet-700 to-purple-700 text-white shadow-lg shadow-purple-950/40'
                          : item.available
                            ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                            : 'cursor-not-allowed text-slate-600'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {!item.available && (
                        <span className="text-[9px] font-medium text-slate-600">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-violet-300/10 p-3">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600"
          >
            <Settings className="h-[18px] w-[18px]" />
            <span className="flex-1">League Settings</span>
            <span className="text-[9px]">Soon</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-violet-300/10 bg-[#0f0c17]/95 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-4 px-4 sm:px-6 xl:px-9">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300 sm:flex">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                {selectedLeagueName || 'Current League'}
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                League workspace
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeLeague()}
              className="gap-2 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Change League</span>
            </Button>
            <div className="hidden items-center gap-2 border-l border-white/10 pl-4 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-700 text-sm font-bold text-white">
                {profileInitial}
              </div>
              <span className="max-w-28 truncate text-sm text-slate-200">
                {profileName}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 xl:px-9">
          {renderPage()}
        </main>
      </div>
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
