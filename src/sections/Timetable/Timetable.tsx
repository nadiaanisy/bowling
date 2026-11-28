import {
useEffect,
useMemo
} from 'react';
import { Filters } from './Filters';
import { AddMatch } from './AddMatch';
import { Schedule } from './Schedule';
import { UseHook } from '../../utils/hooks';
import { ensureBlindTeamForLeague } from '../../utils/api/add';
import {
  getAllMatchesGroupedByMatchAndBlock,
  getBlocksByLeague,
  getTeamsByLeague,
} from '../../utils/api/get';
import {
Card,
CardContent
} from '../../components/card';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import {
  buildLaneOptions,
  countActiveScheduleFilters,
  getMaxWeeksPerBlock,
  getScheduledWeeks,
  getSuggestedSessionDate,
  getUsedScheduleResources,
  resetScheduleFilters,
} from '../../functions/timetable';

export default function Timetable() {
  const {
    selectedLeague,
    listOfLeaguesByUser,
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
    scheduledDate,
    setScheduledDate,
    scheduleType,
    setScheduleType,
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
  } = UseHook();

  const selectedLeagueData = listOfLeaguesByUser.find(
    (league) => String(league.id) === String(selectedLeague),
  );
  const setupConfig = (selectedLeagueData?.setup_config ?? {}) as Record<
    string,
    unknown
  >;
  const commencementDate = String(setupConfig.commencement_date ?? '');
  const configuredSeasonWeeks = Number(
    setupConfig.schedule_weeks ?? selectedLeagueData?.number_of_weeks,
  );
  const configuredBlocks = Number(selectedLeagueData?.number_of_blocks) || 1;
  const registeredTeamTarget = Number(selectedLeagueData?.number_of_teams) || 0;
  const maxWeeksPerBlock = getMaxWeeksPerBlock(
    configuredSeasonWeeks,
    configuredBlocks,
    registeredTeamTarget,
  );

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      setIsLoadingTimetable(true);
      setTimetableLoadError(null);

      try {
        const [blocks, loadedTeams, matchesData] = await Promise.all([
          getBlocksByLeague(selectedLeague),
          getTeamsByLeague(selectedLeague),
          getAllMatchesGroupedByMatchAndBlock(selectedLeague ?? ''),
        ]);

        if (!isCurrent) return;

        let allTeams = loadedTeams;
        if (selectedLeague !== null) {
          const blindTeam = await ensureBlindTeamForLeague(selectedLeague);
          if (!isCurrent) return;
          const isOdd =
            loadedTeams.filter(
              (team) => team.name.trim().toLocaleLowerCase() !== 'blind',
            ).length %
              2 ===
            1;
          if (
            isOdd &&
            blindTeam &&
            !loadedTeams.some(
              (team) => String(team.id) === String(blindTeam.id),
            )
          ) {
            allTeams = [...loadedTeams, blindTeam];
          }
        }

        setBlocksData(blocks);
        const realTeamCount = allTeams.filter(
          (team) => team.name.trim().toLocaleLowerCase() !== 'blind',
        ).length;
        setTimetableTeams(
          allTeams.filter(
            (team) =>
              team.name.trim().toLocaleLowerCase() !== 'blind' ||
              realTeamCount % 2 === 1,
          ),
        );

        setLanes(
          buildLaneOptions(
            Number(selectedLeagueData?.starting_lane),
            Number(selectedLeagueData?.total_lanes),
          ),
        );
        setMatches(matchesData);
      } catch (err) {
        if (isCurrent) {
          setTimetableLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to load the timetable.',
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
    listOfLeaguesByUser,
    selectedLeagueData?.starting_lane,
    selectedLeagueData?.total_lanes,
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

    if (!blocksData.some((block) => block.id === blockNumber)) {
      setBlockNumber(Number(blocksData[0].id));
    }
  }, [blocksData, blockNumber, setBlockNumber]);

  useEffect(() => {
    if (!matches || !blockNumber || !week) {
      setUsedLanes([]);
      setUsedTeams([]);
      return;
    }

    const { teams: usedTeamsForWeek, lanes: usedLanesForWeek } =
      getUsedScheduleResources(
        matches[`block${blockNumber}`] ?? [],
        Number(week),
      );
    setUsedLanes(usedLanesForWeek);
    setUsedTeams(usedTeamsForWeek);
  }, [matches, blockNumber, week, setUsedLanes, setUsedTeams]);

  useEffect(() => {
    if (team1 && usedTeams.includes(team1)) {
      setTeam1('');
    }

    if (team2 && usedTeams.includes(team2)) {
      setTeam2('');
    }

    if (selectedLane && usedLanes.includes(selectedLane)) {
      setSelectedLane('');
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

  const allWeeks = useMemo(() => getScheduledWeeks(matches), [matches]);
  const currentBlockMatches = useMemo(
    () => matches[`block${blockNumber}`] ?? [],
    [matches, blockNumber],
  );
  const activeFiltersCount = useMemo(
    () => countActiveScheduleFilters(filterWeek, filterTeam, filterStatus),
    [filterWeek, filterTeam, filterStatus],
  );

  useEffect(() => {
    const suggestedDate = getSuggestedSessionDate(
      commencementDate,
      blocksData.find((block) => String(block.id) === String(blockNumber))
        ?.number ?? null,
      maxWeeksPerBlock,
      week,
      currentBlockMatches,
    );
    setScheduledDate(suggestedDate);
  }, [
    commencementDate,
    blocksData,
    blockNumber,
    maxWeeksPerBlock,
    week,
    currentBlockMatches,
    setScheduledDate,
  ]);

  useEffect(() => {
    if (
      scheduleType === 'post_bowl' &&
      setupConfig.block_post_bowl_final === true &&
      maxWeeksPerBlock !== null &&
      Number(week) === maxWeeksPerBlock
    ) {
      setScheduleType('regular');
    }
  }, [
    scheduleType,
    setupConfig.block_post_bowl_final,
    maxWeeksPerBlock,
    week,
    setScheduleType,
  ]);

  return (
    <div className="p-4">
      {/* PAGE HEADER */}
      <div>
        <h1>Timetable / Schedule</h1>

        <p className="text-muted-foreground">
          Manage match schedules for each block
        </p>
      </div>

      {/* LOAD ERROR */}
      {timetableLoadError && (
        <Card className="mt-5 border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-destructive" role="alert">
              {timetableLoadError}
            </p>

            <Button
              variant="outline"
              onClick={retryTimetable}
              disabled={isLoadingTimetable}
            >
              {isLoadingTimetable ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ADD MATCH */}
      <div className="mt-5">
        <AddMatch
          selectedLeague={selectedLeague}
          maxWeeksPerBlock={maxWeeksPerBlock}
          scheduleSettings={{
            leagueDay: String(setupConfig.league_day ?? ''),
            commencementDate: String(setupConfig.commencement_date ?? ''),
            practiceTime: String(setupConfig.practice_time ?? ''),
            gameStartTime: String(setupConfig.game_start_time ?? ''),
            lateCutoff: String(setupConfig.late_cutoff ?? ''),
            gamesPerWeek:
              (selectedLeagueData?.games_per_week ??
                setupConfig.games_per_week) == null
                ? null
                : String(
                    selectedLeagueData?.games_per_week ??
                      setupConfig.games_per_week,
                  ),
            playersPerGame:
              (selectedLeagueData?.players_per_game ??
                setupConfig.players_per_game) == null
                ? null
                : String(
                    selectedLeagueData?.players_per_game ??
                      setupConfig.players_per_game,
                  ),
            openBowlersPerWeek:
              setupConfig.open_bowlers_per_week == null
                ? null
                : String(setupConfig.open_bowlers_per_week),
            postponementLimit:
              setupConfig.postponement_limit == null
                ? null
                : String(setupConfig.postponement_limit),
            postponementNoticeDay: String(
              setupConfig.postponement_notice_day ?? '',
            ),
            allowPreBowl: setupConfig.allow_pre_bowl === true,
            allowPostBowl: setupConfig.allow_post_bowl === true,
            blockPostBowlFinal: setupConfig.block_post_bowl_final === true,
            noHolidaySessions: setupConfig.public_holiday === true,
          }}
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
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
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
          activeFiltersCount={activeFiltersCount}
          resetFilters={() =>
            resetScheduleFilters(setFilterWeek, setFilterTeam, setFilterStatus)
          }
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
            leagueId={selectedLeague}
            blocksData={blocksData}
            blockNumber={blockNumber}
            setBlockNumber={setBlockNumber}
            matches={matches}
            filterWeek={filterWeek}
            filterTeam={filterTeam}
            filterStatus={filterStatus}
            selectedMatchIds={selectedMatchIds}
            setSelectedMatchIds={setSelectedMatchIds}
            deletingMatch={deletingMatch}
            setDeletingMatch={setDeletingMatch}
            retryTimetable={async () => {
              retryTimetable();
            }}
            bulkDeleteDialogOpen={bulkDeleteDialogOpen}
            setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
          />
        </div>
      )}
    </div>
  );
}
