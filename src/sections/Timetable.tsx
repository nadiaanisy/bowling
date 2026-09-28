import {
  useEffect,
  useMemo,
} from 'react';
import {
  getAllMatchesGroupedByMatchAndBlock,
  getBlocksByLeague,
  getLanesByLeague,
  getTeamsByLeague,
} from '../utils/api/get';
import {
  Card,
  CardContent,
} from '../components/card';
import { Button } from '../components/button';
import { useCustomHook,} from '../utils/hooks';
import { Skeleton,} from '../components/skeleton';
import { Filters } from '../sub-components/Timetable/Filters';
import { AddMatch } from '../sub-components/Timetable/AddMatch';
import { Schedule } from '../sub-components/Timetable/Schedule';

export default function Timetable() {
  const {
    selectedLeague,
    blocksData,
    setBlocksData,
    blockNumber,
    setBlockNumber,
    timetableTeams,
    setTimetableTeams,
    lanes,
    setLanes,
    matches,
    setMatches,
    usedTeams,
    setUsedTeams,
    usedLanes,
    setUsedLanes,
    team1,
    setTeam1,
    team2,
    setTeam2,
    week,
    setWeek,
    selectedLane,
    setSelectedLane,
    filterWeek,
    setFilterWeek,
    filterTeam,
    setFilterTeam,
    filterStatus,
    setFilterStatus,
    isLoadingTimetable,
    setIsLoadingTimetable,
    timetableLoadError,
    setTimetableLoadError,
    timetableReloadKey,
    retryTimetable,
    creatingMatch,
    setCreatingMatch,
    deletingMatch,
    setDeletingMatch,

    selectedMatchIds,
    setSelectedMatchIds,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
  } = useCustomHook();

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      setIsLoadingTimetable(true);
      setTimetableLoadError(null);

      try {
        const [
          blocks,
          allTeams,
          lanesData,
          matchesData,
        ] = await Promise.all([
          getBlocksByLeague(selectedLeague),
          getTeamsByLeague(selectedLeague),
          getLanesByLeague(selectedLeague),
          getAllMatchesGroupedByMatchAndBlock(
            selectedLeague ?? ''
          ),
        ]);

        if (!isCurrent) return;

        setBlocksData(blocks);
        setTimetableTeams(allTeams);
        setLanes(lanesData);
        setMatches(matchesData);
      } catch (err) {
        if (isCurrent) {
          setTimetableLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to load the timetable.'
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingTimetable(false);
        }
      }
    };

    void loadData();

    return () => {
      isCurrent = false;
    };
  }, [
    selectedLeague,
    timetableReloadKey,
    setBlocksData,
    setTimetableTeams,
    setLanes,
    setMatches,
    setIsLoadingTimetable,
    setTimetableLoadError,
  ]);

  useEffect(() => {
    if (blocksData.length === 0) return;

    if (
      !blocksData.some(
        (block) => block.id === blockNumber
      )
    ) {
      setBlockNumber(
        Number(blocksData[0].id)
      );
    }
  }, [
    blocksData,
    blockNumber,
    setBlockNumber,
  ]);

  useEffect(() => {
    if (!matches || !blockNumber || !week) {
      setUsedLanes([]);
      setUsedTeams([]);
      return;
    }

    const blockKey = `block${blockNumber}`;

    const blockMatches =
      matches[blockKey] || [];

    const filtered = blockMatches.filter(
      (match) =>
        match.week_number ===
        parseInt(week)
    );

    const usedLanesForWeek =
      filtered.map(
        (match) => match.lane
      );

    const usedTeamsForWeek =
      filtered.flatMap((match) =>
        [
          match.team1?.id?.toString(),
          match.team2?.id?.toString(),
        ].filter(Boolean) as string[]
      );

    setUsedLanes(
      usedLanesForWeek
    );

    setUsedTeams(
      usedTeamsForWeek
    );
  }, [
    matches,
    blockNumber,
    week,
    setUsedLanes,
    setUsedTeams,
  ]);

  useEffect(() => {
    if (
      team1 &&
      usedTeams.includes(team1)
    ) {
      setTeam1("");
    }

    if (
      team2 &&
      usedTeams.includes(team2)
    ) {
      setTeam2("");
    }

    if (
      selectedLane &&
      usedLanes.includes(selectedLane)
    ) {
      setSelectedLane("");
    }
  }, [
    usedTeams,
    usedLanes,
    team1,
    team2,
    selectedLane,
    setTeam1,
    setTeam2,
    setSelectedLane,
  ]);

  const allWeeks = useMemo(() => {
    const weeks = new Set<number>();

    Object.values(matches).forEach(
      (blockMatches) => {
        blockMatches?.forEach(
          (match) => {
            if (match.week_number) {
              weeks.add(
                match.week_number
              );
            }
          }
        );
      }
    );

    return Array.from(weeks).sort(
      (a, b) => a - b
    );
  }, [matches]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filterWeek !== 'all') {
      count++;
    }

    if (filterTeam !== 'all') {
      count++;
    }

    if (filterStatus !== 'all') {
      count++;
    }

    return count;
  }, [
    filterWeek,
    filterTeam,
    filterStatus,
  ]);

  const resetFilters = () => {
    setFilterWeek('all');
    setFilterTeam('all');
    setFilterStatus('all');
  };

  return (
    <div className="p-4">

      {/* PAGE HEADER */}
      <div>
        <h1>
          Timetable / Schedule
        </h1>

        <p className="text-muted-foreground">
          Manage match schedules for each block
        </p>
      </div>

      {/* LOAD ERROR */}
      {timetableLoadError && (
        <Card className="mt-5 border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p
              className="text-sm text-destructive"
              role="alert"
            >
              {timetableLoadError}
            </p>

            <Button
              variant="outline"
              onClick={retryTimetable}
              disabled={isLoadingTimetable}
            >
              {isLoadingTimetable
                ? 'Retrying...'
                : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ADD MATCH */}
      <div className="mt-5">
        <AddMatch
          selectedLeague={selectedLeague}
          blocksData={blocksData}
          blockNumber={blockNumber}
          setBlockNumber={setBlockNumber}
          timetableTeams={timetableTeams}
          lanes={lanes}
          usedTeams={usedTeams}
          usedLanes={usedLanes}
          team1={team1}
          setTeam1={setTeam1}
          team2={team2}
          setTeam2={setTeam2}
          week={week}
          setWeek={setWeek}
          selectedLane={selectedLane}
          setSelectedLane={setSelectedLane}
          creatingMatch={creatingMatch}
          setCreatingMatch={setCreatingMatch}
          retryTimetable={async () => {
            retryTimetable();
          }}
        />
      </div>

      {/* FILTERS */}
      <div className="mt-5">
        <Filters
          allWeeks={allWeeks}
          timetableTeams={timetableTeams}
          filterWeek={filterWeek}
          setFilterWeek={setFilterWeek}
          filterTeam={filterTeam}
          setFilterTeam={setFilterTeam}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          activeFiltersCount={
            activeFiltersCount
          }
          resetFilters={resetFilters}
        />
      </div>

      {/* SCHEDULE */}
      {isLoadingTimetable ? (
        <div className="space-y-6 mt-20">
          <div className="grid gap-4">
            <Card className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Schedule
            blocksData={blocksData}
            blockNumber={blockNumber}
            setBlockNumber={setBlockNumber}
            matches={matches}
            filterWeek={filterWeek}
            filterTeam={filterTeam}
            filterStatus={filterStatus}
            selectedMatchIds={selectedMatchIds}
            setSelectedMatchIds={
              setSelectedMatchIds
            }
            deletingMatch={deletingMatch}
            setDeletingMatch={
              setDeletingMatch
            }
            retryTimetable={async () => {
              retryTimetable();
            }}
            bulkDeleteDialogOpen={
              bulkDeleteDialogOpen
            }
            setBulkDeleteDialogOpen={
              setBulkDeleteDialogOpen
            }
          />
        </div>
      )}
    </div>
  );
}