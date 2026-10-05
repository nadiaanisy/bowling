import {
  getAllBlocksByLeagueId,
  getAllMatchesDataByWeekAndBlock,
  getWeeksByBlocks,
} from '../utils/api/get';
import { Card, CardContent } from '../components/card';
import { useEffect } from 'react';
import { useCustomHook } from '../utils/hooks';
import ScoreSelectors from '../sub-components/Scores/Selectors';
import ScoresMatchList from '../sub-components/Scores/MatchList';

export default function Scores() {
  const {
    blockNumber,
    weekInScores,
    scores,
    activePlayers,
    blocksData,
    weeksAvailable,
    isLoadingSkeleton,
    selectedPlayerDropdown,
    playerScores,
    savedMatches,
    selectedLeague,
    listOfLeaguesByUser,
    setBlockNumber,
    setWeekInScores,
    setScores,
    setActivePlayers,
    setBlocksData,
    setWeeksAvailable,
    setIsLoadingSkeleton,
    setSelectedPlayerDropdown,
    setPlayerScores,
    setSavedMatches,
  } = useCustomHook();

  const selectedLeagueData = listOfLeaguesByUser.find(
    (league) => String(league.id) === String(selectedLeague),
  );

  const gamesPerWeek = Math.max(
    1,
    Number(selectedLeagueData?.games_per_week ?? 3),
  );

  const playersPerGame = Math.max(
    1,
    Number(selectedLeagueData?.players_per_game ?? 1),
  );

  useEffect(() => {
    const loadBlocks = async () => {
      if (!selectedLeague) return;

      setIsLoadingSkeleton(true);

      const blockslist = await getAllBlocksByLeagueId(
        selectedLeague as string | number,
      );

      setBlocksData(blockslist);

      if (blockslist.length > 0) {
        setBlockNumber((current: number | null) => {
          const currentExists = blockslist.some(
            (block: any) => Number(block.id) === current,
          );

          return currentExists ? current : Number(blockslist[0].id);
        });
      } else {
        setBlockNumber(null);
        setWeeksAvailable([]);
      }

      setIsLoadingSkeleton(false);
    };

    loadBlocks();
  }, [selectedLeague]);

  useEffect(() => {
    const loadWeeks = async () => {
      if (!selectedLeague || !blockNumber) {
        setWeeksAvailable([]);
        return;
      }

      const weekslist = await getWeeksByBlocks(
        blockNumber,
        selectedLeague as string | number,
      );

      setWeeksAvailable(weekslist);
    };

    loadWeeks();
  }, [blockNumber, selectedLeague]);

  useEffect(() => {
    const loadScores = async () => {
      if (!selectedLeague || !blockNumber || !weekInScores) {
        setScores([]);
        return;
      }

      setIsLoadingSkeleton(true);

      const matches = await getAllMatchesDataByWeekAndBlock(
        weekInScores,
        blockNumber as number,
        selectedLeague as string | number,
      );

      setScores(matches);
      setIsLoadingSkeleton(false);
    };

    loadScores();
  }, [weekInScores, blockNumber, selectedLeague]);

  useEffect(() => {
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      setPlayerScores({});
      setActivePlayers({});
      return;
    }

    const loadedPlayerScores: any = {};
    const loadedActivePlayers: any = {};

    scores.forEach((match: any, matchIndex: number) => {
      loadedPlayerScores[matchIndex] = {
        team1: {},
        team2: {},
      };

      loadedActivePlayers[matchIndex] = {
        team1: [],
        team2: [],
      };

      [1, 2].forEach((teamNum) => {
        const team = match[`team${teamNum}`];

        if (!team?.players) return;

        team.players.forEach((player: any) => {
          if (player.scratch === undefined && player.totalWHdc === undefined) {
            return;
          }

          loadedActivePlayers[matchIndex][`team${teamNum}`].push(player.id);

          const playerScore: any = {
            hdc: String(player.hdc ?? 0),
          };

          const savedGames =
            player.games && typeof player.games === 'object'
              ? player.games
              : {};

          for (let gameIndex = 1; gameIndex <= gamesPerWeek; gameIndex++) {
            playerScore[`game${gameIndex}`] = String(
              savedGames[`g${gameIndex}`] ?? player[`g${gameIndex}`] ?? 0,
            );
          }

          loadedPlayerScores[matchIndex][`team${teamNum}`][player.id] =
            playerScore;
        });
      });
    });

    setPlayerScores(loadedPlayerScores);
    setActivePlayers(loadedActivePlayers);
  }, [scores, gamesPerWeek]);

  return (
    <div className="p-4">
      <div>
        <h1>Score Input</h1>
        <p className="text-muted-foreground">
          Enter and manage scores for each week
        </p>
      </div>

      <div className="mt-5">
        <ScoreSelectors
          blockNumber={blockNumber}
          weekInScores={weekInScores}
          blocksData={blocksData}
          weeksAvailable={weeksAvailable}
          setBlockNumber={setBlockNumber}
          setWeekInScores={setWeekInScores}
          setScores={setScores}
          setActivePlayers={setActivePlayers}
        />

        {scores && scores.length > 0 ? (
          <ScoresMatchList
            scores={scores}
            weekInScores={weekInScores}
            gamesPerWeek={gamesPerWeek}
            playersPerGame={playersPerGame}
            activePlayers={activePlayers}
            selectedPlayerDropdown={selectedPlayerDropdown}
            playerScores={playerScores}
            savedMatches={savedMatches}
            selectedLeague={selectedLeague}
            blockNumber={blockNumber}
            setActivePlayers={setActivePlayers}
            setSelectedPlayerDropdown={setSelectedPlayerDropdown}
            setPlayerScores={setPlayerScores}
            setScores={setScores}
            setIsLoadingSkeleton={setIsLoadingSkeleton}
            setSavedMatches={setSavedMatches}
          />
        ) : (
          <Card style={{ marginTop: 48 }}>
            <CardContent className="pt-6">
              {weekInScores ? (
                <p className="text-center text-muted-foreground">
                  No matches scheduled for Week {weekInScores}
                </p>
              ) : (
                <p className="text-center text-muted-foreground">
                  Please select a week to view match scores.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
