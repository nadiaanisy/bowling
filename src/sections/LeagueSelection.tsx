import {
  useEffect,
} from 'react';
import {
  Trophy,
  Loader2,
  LogOut,
  Plus,
  FolderOpen,
  Layers
} from 'lucide-react';
import {
  checkIfLeagueHasBlocks,
  getTeamCountByLeague
} from '../utils/api/get';
import {
  handleBlockSetup,
  handleCreateLeague,
  handleDeleteLeague,
  handleLeagueBlockSetup,
  handleLeagueSelect
} from '../utils/functions';
import {
  Card,
  CardContent
} from '../components/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/alert-dialog';
import { motion } from 'motion/react';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { useCustomHook } from '../utils/hooks';
import { Skeleton } from '../components/skeleton';
import { LeagueCard } from '../sub-components/LeagueCard';

interface LeagueSelectionProps {
  onBackToLanding?: () => void;
  onLogout?: () => void;
  onLeagueOpened?: () => void;
}

export default function LeagueSelection({
  onBackToLanding,
  onLogout,
  onLeagueOpened
}: LeagueSelectionProps) {
  const {
    listOfLeaguesByUser: leagues,
    userData,
    selectLeague,
    isLoadingLeagues,
    leagueLoadError,
    retryLoadLeagues,
    logout,
    showBlockDialog,
    isLoadingLeagueDetails,
    blockCount,
    newLeagueName,
    showCreateLeagueDialog,
    selectedLeagueName,
    leagueBlockStatus,
    teamCounts,
    selectedLeagueId,
    confirmOpen,
    confirmMessage,
    confirmAction,
    creatingBlocks,
    creatingLeague,
    deletingLeague,
    setShowBlockDialog,
    setIsLoadingLeagueDetails,
    setBlockCount,
    setNewLeagueName,
    setListOfLeaguesByUser,
    setShowCreateLeagueDialog,
    setSelectedLeagueName,
    setLeagueBlockStatus,
    setTeamCounts,
    setSelectedLeagueId,
    setConfirmOpen,
    setConfirmMessage,
    setConfirmAction,
    setCreatingBlocks,
    setCreatingLeague,
    setDeletingLeague,
  } = useCustomHook();

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingLeagueDetails(leagues.length > 0);

    Promise.all(
      leagues.map(async (league) => {
        const [hasBlocks, teamCount] = await Promise.all([
          checkIfLeagueHasBlocks(league.id),
          getTeamCountByLeague(league.id)
        ]);

        return {
          id: league.id,
          hasBlocks,
          teamCount
        };
      })
    ).then((details) => {
      if (!isCurrent) return;

      setLeagueBlockStatus(
        Object.fromEntries(details.map(({ id, hasBlocks }) => [id, hasBlocks]))
      );
      setTeamCounts(
        Object.fromEntries(details.map(({ id, teamCount }) => [id, teamCount]))
      );
      setIsLoadingLeagueDetails(false);
    }).catch(() => {
      if (isCurrent) setIsLoadingLeagueDetails(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [leagues]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Header */}
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
                  <h1 className="text-xl font-bold gradient-text">Strike Manager</h1>
                  <p className="text-xs text-muted-foreground">Professional Bowling League System</p>
                </div>
              </button>
              <Button
                variant="outline"
                onClick={onLogout ?? logout}
                className="gap-2 text-muted-foreground hover:text-foreground glass border-border/50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            {/* Title block */}
            <div className="text-center mb-10 space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="mx-auto w-fit"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 blur-xl bg-primary/40 rounded-full" />
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold gradient-text">
                {leagueLoadError
                  ? 'Unable to load leagues'
                  : isLoadingLeagues
                  ? 'Loading leagues...'
                  : leagues.length === 0
                  ? 'No Leagues Yet'
                  : 'Select a League'}
              </h2>
              <p className="text-muted-foreground">
                {leagueLoadError
                  ? 'Your leagues could not be loaded. Please retry or sign in again.'
                  : isLoadingLeagues
                  ? 'Fetching your bowling leagues'
                  : leagues.length === 0
                  ? 'Create your first league to get started'
                  : 'Choose which bowling league you want to manage'}
              </p>
            </div>

            {/* League loading error */}
            {leagueLoadError ? (
              <Card className="glass border-border/50">
                <CardContent className="py-12 flex flex-col items-center gap-5 text-center">
                  <p className="text-sm text-destructive" role="alert">{leagueLoadError}</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={() => void retryLoadLeagues()} disabled={isLoadingLeagues}>
                      {isLoadingLeagues ? 'Retrying...' : 'Retry'}
                    </Button>
                    <Button variant="outline" onClick={onLogout ?? logout}>Sign out</Button>
                  </div>
                </CardContent>
              </Card>
            ) : leagues.length === 0 && !isLoadingLeagues ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass border-border/50 border-dashed">
                  <CardContent className="py-16 flex flex-col items-center gap-6 text-center">
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                      <FolderOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">No leagues created</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        You don't have any leagues set up yet. Create your first league to start managing teams, players, and scores.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => setShowCreateLeagueDialog(true)}
                      className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                    >
                      <Plus className="h-5 w-5" />
                      Create Your First League
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                {/* League cards */}
                {isLoadingLeagues || isLoadingLeagueDetails ? (
                  <div className={`space-y-4 ${leagues.length > 3 ? 'max-h-[28rem] overflow-y-auto pr-2' : ''}`}>
                    {(leagues.length > 0 ? leagues : [{ id: 'loading' }]).map((league) => (
                        <Card key={league.id} className="glass border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />
                              <div className="space-y-2 min-w-0">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48 max-w-full" />
                              </div>
                            </div>
                            <Skeleton className="h-9 w-20 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={`space-y-4 ${leagues.length > 3 ? 'max-h-[28rem] overflow-y-auto pr-2' : ''}`}>
                    {leagues.map((league, index) => (
                      <LeagueCard
                        key={league.id}
                        league={league}
                        hasBlocks={leagueBlockStatus[league.id] ?? false}
                        teamCount={teamCounts[league.id] ?? 0}
                        index={index}
                        onOpen={() => {
                          onLeagueOpened?.();
                          handleLeagueSelect(
                            league.id,
                            league.name,
                            leagueBlockStatus[league.id] ?? false,
                            selectLeague,
                            setSelectedLeagueId,
                            setSelectedLeagueName
                          );
                        }}
                        onSetupBlocks={() => handleLeagueBlockSetup(
                          league.id,
                          league.name,
                          false,
                          selectLeague,
                          setSelectedLeagueId,
                          setSelectedLeagueName,
                          setShowBlockDialog
                        )}
                        onDelete={() => handleDeleteLeague(
                          league.id,
                          league.name,
                          setListOfLeaguesByUser,
                          setLeagueBlockStatus,
                          setTeamCounts,
                          setConfirmMessage,
                          setConfirmAction,
                          setConfirmOpen
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Add another league */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 glass border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40"
                    onClick={() => setShowCreateLeagueDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Another League
                  </Button>
                </motion.div>
              </>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              {leagues.length > 0 && 'You can switch between leagues at any time from the dashboard header.'}
            </motion.p>
          </motion.div>
        </main>
      </div>

      {/* Create League dialog */}
      <Dialog open={showCreateLeagueDialog} onOpenChange={setShowCreateLeagueDialog}>
        <DialogContent
          className="glass border-border/50"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span className="gradient-text">Create a New League</span>
            </DialogTitle>
            <DialogDescription>
              Give your league a name. You can set up teams, players, and blocks after creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="leagueName">League Name</Label>
              <Input
                id="leagueName"
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void handleCreateLeague(
                    creatingLeague,
                    setCreatingLeague,
                    newLeagueName,
                    userData?.id,
                    setListOfLeaguesByUser,
                    setNewLeagueName,
                    setShowCreateLeagueDialog
                  )}
                placeholder="e.g. Sunray League"
                className="bg-input border-border/50"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowCreateLeagueDialog(false); setNewLeagueName(''); }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateLeague(
                creatingLeague,
                setCreatingLeague,
                newLeagueName,
                userData?.id,
                setListOfLeaguesByUser,
                setNewLeagueName,
                setShowCreateLeagueDialog
              )}
              disabled={creatingLeague || !newLeagueName.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md shadow-purple-500/30"
            >
              {creatingLeague ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create League
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block setup dialog */}
      <Dialog
        open={showBlockDialog}
        onOpenChange={(open) => {
          if (!open && creatingBlocks) return;
          setShowBlockDialog(open);
        }}
      >
        <DialogContent
          className="glass border-border/50"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text">Set Up Blocks</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{selectedLeagueName}</span> has no block data yet.
              How many blocks would you like to create?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="blockCount">Number of Blocks</Label>
              <Input
                id="blockCount"
                type="number"
                min="1"
                max="10"
                value={blockCount}
                onChange={(e) => setBlockCount(e.target.value)}
                placeholder="Enter number of blocks (1–10)"
                className="bg-input border-border/50"
              />
              <p className="text-sm text-muted-foreground">
                Typical leagues use 2 blocks. You can create up to 10 blocks.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => void handleBlockSetup(
                creatingBlocks,
                setCreatingBlocks,
                selectedLeagueId,
                blockCount,
                setLeagueBlockStatus,
                setShowBlockDialog
              )}
              disabled={creatingBlocks || !blockCount || parseInt(blockCount) < 1 || parseInt(blockCount) > 10}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md shadow-purple-500/30"
            >
              {creatingBlocks ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Blocks
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && deletingLeague) return;
          setConfirmOpen(open);
        }}
      >
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete league?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLeague}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingLeague}
              onClick={async (event) => {
                event.preventDefault();

                if (deletingLeague) return;

                setDeletingLeague(true);
                try {
                  await confirmAction();
                } finally {
                  setDeletingLeague(false);
                  setConfirmOpen(false);
                }
              }}
            >
              {deletingLeague ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
