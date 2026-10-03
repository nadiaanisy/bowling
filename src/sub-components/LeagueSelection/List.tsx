import { Trophy, Plus, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '../../components/card';
import type React from 'react';
import { motion } from 'motion/react';
import {
  handleDeleteLeague,
  handleLeagueBlockSetup,
  handleLeagueSelect,
} from '../../utils/functions/league';
import { League } from '../../utils/interfaces';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import { LeagueCard } from '../../sub-components/LeagueSelection/LeagueCard';

interface ListProps {
  leagues: League[];
  isLoadingLeagues: boolean;
  isLoadingLeagueDetails: boolean;
  leagueLoadError?: string | null;
  leagueBlockStatus: Record<string | number, boolean>;
  teamCounts: Record<string | number, number>;
  selectLeague: (league: {
    id: string | number;
    hasBlocks?: boolean;
  }) => Promise<boolean>;
  retryLoadLeagues: () => Promise<unknown> | void;
  logout: () => void;
  onLeagueOpened?: () => void;
  setShowCreateLeagueDialog: (value: boolean) => void;
  setSelectedLeagueId: (value: string | number | null) => void;
  setSelectedLeagueName: (value: string) => void;
  setShowBlockDialog: (value: boolean) => void;
  setListOfLeaguesByUser: React.Dispatch<React.SetStateAction<League[]>>;
  setLeagueBlockStatus: React.Dispatch<
    React.SetStateAction<Record<string | number, boolean>>
  >;
  setTeamCounts: React.Dispatch<
    React.SetStateAction<Record<string | number, number>>
  >;
  setConfirmMessage: (value: React.ReactNode) => void;
  setConfirmAction: React.Dispatch<
    React.SetStateAction<() => void | Promise<void>>
  >;
  setConfirmOpen: (value: boolean) => void;
}

export default function List({
  leagues,
  isLoadingLeagues,
  isLoadingLeagueDetails,
  leagueLoadError,
  leagueBlockStatus,
  teamCounts,
  selectLeague,
  retryLoadLeagues,
  logout,
  onLeagueOpened,
  setShowCreateLeagueDialog,
  setSelectedLeagueId,
  setSelectedLeagueName,
  setShowBlockDialog,
  setListOfLeaguesByUser,
  setLeagueBlockStatus,
  setTeamCounts,
  setConfirmMessage,
  setConfirmAction,
  setConfirmOpen,
}: ListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      {/* Title */}
      <div className="text-center mb-10 space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            delay: 0.1,
          }}
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

      {/* Error */}
      {leagueLoadError ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12 flex flex-col items-center gap-5 text-center">
            <p className="text-sm text-destructive" role="alert">
              {leagueLoadError}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => void retryLoadLeagues()}
                disabled={isLoadingLeagues}
              >
                {isLoadingLeagues ? 'Retrying...' : 'Retry'}
              </Button>

              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : leagues.length === 0 && !isLoadingLeagues ? (
        /* Empty */
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
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
                  You don't have any leagues set up yet. Create your first
                  league to start managing teams, players, and scores.
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
        /* League content */
        <>
          {isLoadingLeagues || isLoadingLeagueDetails ? (
            <LeagueLoadingState leagues={leagues} />
          ) : (
            <div
              className={`space-y-4 ${
                leagues.length > 3 ? 'max-h-[28rem] overflow-y-auto pr-2' : ''
              }`}
            >
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
                      setSelectedLeagueName,
                    );
                  }}

                  onSetupBlocks={() =>
                    handleLeagueBlockSetup(
                      league.id,
                      league.name,
                      false,
                      selectLeague,
                      setSelectedLeagueId,
                      setSelectedLeagueName,
                      setShowBlockDialog,
                    )
                  }

                  onDelete={() =>
                    handleDeleteLeague(
                      league.id,
                      league.name,
                      setListOfLeaguesByUser,
                      setLeagueBlockStatus,
                      setTeamCounts,
                      setConfirmMessage,
                      setConfirmAction,
                      setConfirmOpen,
                    )
                  }
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
        {leagues.length > 0 &&
          'You can switch between leagues at any time from the dashboard header.'}
      </motion.p>
    </motion.div>
  );
}

function LeagueLoadingState({ leagues }: { leagues: League[] }) {
  const loadingLeagues =
    leagues.length > 0 ? leagues : [{ id: 'loading', name: '' }];

  return (
    <div
      className={`space-y-4 ${
        leagues.length > 3 ? 'max-h-[28rem] overflow-y-auto pr-2' : ''
      }`}
    >
      {loadingLeagues.map((league) => (
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
  );
}
