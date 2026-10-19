import { useEffect } from 'react';
import List from './List';
import Header from './Header';
import CreateDialog from './CreateDialog';
import DeleteDialog from './DeleteDialog';
import { UseHook } from '../../utils/hooks';
import BlockSetupDialog from './BlockSetupDialog';
import { getMyLeagueSummaries } from '../../utils/api/get';
import { League } from '../../utils/interfaces';

interface LeagueSelectionProps {
  onBackToLanding?: () => void;
  onLogout?: () => void;
  onLeagueOpened?: () => void;
}

export default function LeagueSelection({
  onBackToLanding,
  onLogout,
  onLeagueOpened,
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
    blockCount,
    gamesPerWeek,
    startingLane,
    totalLanes,
    newLeagueName,
    selectedLeagueName,
    isLoadingLeagueDetails,
    showCreateLeagueDialog,
    leagueBlockStatus,
    teamCounts,
    selectedLeagueId,
    confirmOpen,
    confirmMessage,
    confirmAction,
    creatingBlocks,
    creatingLeague,
    deletingLeague,
    playersPerGame,
    setShowBlockDialog,
    setIsLoadingLeagueDetails,
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
    setBlockCount,
    setGamesPerWeek,
    setPlayersPerGame,
    setStartingLane,
    setNewLeagueName,
    setListOfLeaguesByUser,
    setTotalLanes,
    editingLeague,
    setEditingLeague,
  } = UseHook();

  const leagueIds = leagues
    .map((league: League) => String(league.id))
    .join(',');

  useEffect(() => {
    void retryLoadLeagues();
  }, []);

  useEffect(() => {
    let isCurrent = true;

    setIsLoadingLeagueDetails(leagues.length > 0);

    if (leagues.length === 0) {
      setLeagueBlockStatus({});
      setTeamCounts({});
      setIsLoadingLeagueDetails(false);

      return () => {
        isCurrent = false;
      };
    }

    getMyLeagueSummaries()
      .then((details) => {
        if (!isCurrent) return;

        const visibleLeagueIds = new Set(
          leagues.map((league) => String(league.id)),
        );

        setLeagueBlockStatus(
          Object.fromEntries(
            details
              .filter((item) => visibleLeagueIds.has(String(item.league_id)))
              .map((item) => [item.league_id, item.has_blocks]),
          ),
        );

        setTeamCounts(
          Object.fromEntries(
            details
              .filter((item) => visibleLeagueIds.has(String(item.league_id)))
              .map((item) => [item.league_id, Number(item.team_count)]),
          ),
        );

        setIsLoadingLeagueDetails(false);
      })
      .catch((error) => {
        if (!isCurrent) return;

        console.error('Failed to load league summaries:', error);
        setIsLoadingLeagueDetails(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [leagueIds]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />

          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />

          <div
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <Header
          onBackToLanding={onBackToLanding}
          onLogout={onLogout ?? logout}
        />

        <main className="relative z-10 container mx-auto px-4 py-16">
          <List
            leagues={leagues}
            isLoadingLeagues={isLoadingLeagues}
            isLoadingLeagueDetails={isLoadingLeagueDetails}
            leagueLoadError={leagueLoadError}
            leagueBlockStatus={leagueBlockStatus}
            teamCounts={teamCounts}
            selectLeague={selectLeague}
            retryLoadLeagues={retryLoadLeagues}
            logout={onLogout ?? logout}
            onLeagueOpened={onLeagueOpened}
            setShowCreateLeagueDialog={setShowCreateLeagueDialog}
            setSelectedLeagueId={setSelectedLeagueId}
            setSelectedLeagueName={setSelectedLeagueName}
            setShowBlockDialog={setShowBlockDialog}
            setListOfLeaguesByUser={setListOfLeaguesByUser}
            setLeagueBlockStatus={setLeagueBlockStatus}
            setTeamCounts={setTeamCounts}
            setConfirmMessage={setConfirmMessage}
            setConfirmAction={setConfirmAction}
            setConfirmOpen={setConfirmOpen}
            setEditingLeague={setEditingLeague}
            setNewLeagueName={setNewLeagueName}
          />
        </main>
      </div>

      <CreateDialog
        open={showCreateLeagueDialog}
        onOpenChange={(open) => {
          setShowCreateLeagueDialog(open);

          if (!open) {
            setNewLeagueName('');
          }
        }}
        newLeagueName={newLeagueName}
        setNewLeagueName={setNewLeagueName}
        creatingLeague={creatingLeague}
        setCreatingLeague={setCreatingLeague}
        userId={userData?.id}
        setListOfLeaguesByUser={setListOfLeaguesByUser}
        editingLeague={editingLeague}
      />

      <BlockSetupDialog
        open={showBlockDialog}
        onOpenChange={(open) => {
          if (!open && creatingBlocks) return;

          setShowBlockDialog(open);

          if (!open) {
            setBlockCount('');
            setGamesPerWeek('');
            setPlayersPerGame('');
            setStartingLane('');
            setTotalLanes('');
            setSelectedLeagueId(null);
            setSelectedLeagueName('');
          }
        }}
        selectedLeagueName={selectedLeagueName}
        selectedLeagueId={selectedLeagueId}
        blockCount={blockCount}
        setBlockCount={setBlockCount}
        gamesPerWeek={gamesPerWeek}
        setGamesPerWeek={setGamesPerWeek}
        playersPerGame={playersPerGame}
        setPlayersPerGame={setPlayersPerGame}
        startingLane={startingLane}
        setStartingLane={setStartingLane}
        totalLanes={totalLanes}
        setTotalLanes={setTotalLanes}
        creatingBlocks={creatingBlocks}
        setCreatingBlocks={setCreatingBlocks}
        setLeagueBlockStatus={setLeagueBlockStatus}
        setListOfLeaguesByUser={setListOfLeaguesByUser}
      />

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && deletingLeague) return;
          setConfirmOpen(open);
        }}
        confirmMessage={confirmMessage}
        confirmAction={confirmAction}
        deletingLeague={deletingLeague}
        setDeletingLeague={setDeletingLeague}
      />
    </>
  );
}
