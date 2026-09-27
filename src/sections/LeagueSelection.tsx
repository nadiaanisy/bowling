import { useEffect } from 'react';
import {
  checkIfLeagueHasBlocks,
  getTeamCountByLeague
 } from '../utils/api/get';
import { useCustomHook } from '../utils/hooks';
import List from '../sub-components/LeagueSelection/List';
import Header from '../sub-components/LeagueSelection/Header';
import CreateDialog from '../sub-components/LeagueSelection/CreateDialog';
import DeleteDialog from '../sub-components/LeagueSelection/DeleteDialog';
import BlockSetupDialog from '../sub-components/LeagueSelection/BlockSetupDialog';

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

  const leagueIds = leagues
    .map((league) => String(league.id))
    .join(',');

  useEffect(() => {
    void retryLoadLeagues();
  }, []);

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
    )
      .then((details) => {
        if (!isCurrent) return;

        setLeagueBlockStatus(
          Object.fromEntries(
            details.map(({ id, hasBlocks }) => [
              id,
              hasBlocks
            ])
          )
        );

        setTeamCounts(
          Object.fromEntries(
            details.map(({ id, teamCount }) => [
              id,
              teamCount
            ])
          )
        );

        setIsLoadingLeagueDetails(false);
      })
      .catch(() => {
        if (isCurrent) {
          setIsLoadingLeagueDetails(false);
        }
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
          />
        </main>
      </div>

      <CreateDialog
        open={showCreateLeagueDialog}
        onOpenChange={setShowCreateLeagueDialog}
        newLeagueName={newLeagueName}
        setNewLeagueName={setNewLeagueName}
        creatingLeague={creatingLeague}
        setCreatingLeague={setCreatingLeague}
        userId={userData?.id}
        setListOfLeaguesByUser={setListOfLeaguesByUser}
      />

      <BlockSetupDialog
        open={showBlockDialog}
        onOpenChange={(open) => {
          if (!open && creatingBlocks) return;
          setShowBlockDialog(open);
        }}
        selectedLeagueName={selectedLeagueName}
        selectedLeagueId={selectedLeagueId}
        blockCount={blockCount}
        setBlockCount={setBlockCount}
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