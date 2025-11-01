import {
  blocks_table,
  leagues_table,
  players_table,
  teams_table,
  timetable_table,
  weekly_scores_table
} from './data';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

/* --- STYLE SECTION --- */
export const errorToastStyle = {
  style: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  }
};

export const successToastStyle = {
  style: {
    background: '#e2feefff',
    color: '#1cb968ff',
    border: '1px solid #a5fcc6ff',
  }
}

/* --- CATCH ERROR TOAST --- */
export const catchError = (customErrMessage: string, err: any) => {
  const message = err instanceof Error ? err.message : String(err);
  toast.error(customErrMessage + message, errorToastStyle);
};

/* --- ACTIONS AREA --- */
/* --- Login --- */
export const handleLoginButton = async (
  e: React.FormEvent,
  login: (password: string) => Promise<boolean>,
  password: string
) => {
  e.preventDefault();
  console.log('masuk sini')
  const success = await login(password);
  if (!success) {
    toast.error('Invalid password!', errorToastStyle);
  }
};

/* --- Ask for Confirmation --- */
export const askConfirm = (
  message: string,
  action: () => void,
  setConfirmMessage: (msg: string) => void,
  setConfirmAction: (fn: () => void) => void,
  setConfirmOpen: (open: boolean) => void
) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setConfirmOpen(true);
};

/* --- Handle Block Changed in Scores.tsx --- */
export const handleBlockChange = (
  blockNumber: number,
  setBlockNumber: (val: number) => void,
  setWeek: (val: string) => void,
  setScores: (val: Record<string, number>) => void,
  setActivePlayers: (val: Record<string, boolean>) => void
) => {
  setBlockNumber(blockNumber);
  setWeek('');
  setScores({});
  setActivePlayers({});
};

/* --- Handle Week Changed in Scores.tsx --- */
export const handleWeekChange = (
  week: string,
  setWeek: (val: string) => void,
  setScores: (val: Record<string, number>) => void,
  setActivePlayers: (val: Record<string, boolean>) => void,
) => {
  setWeek(week);
  setScores({});
  setActivePlayers({});
};

/* --- Get list of available players for a team who haven't been selected yet for the match --- */
export const getAvailablePlayers = (
  matchIndex: number,
  teamNum: 1 | 2,
  team: any,
  activePlayers: Record<number, { team1: number[]; team2: number[] }>
) => {
  if (!team?.players) return [];
  const activePlayerIds = activePlayers[matchIndex]?.[`team${teamNum}`] || [];
  return team.players.filter((player: any) => !activePlayerIds.includes(player.id));
};

/* ---  Add a selected player to the active players list for a given match & team. --- */
export const addPlayerToMatch = (
  matchIndex: number,
  teamNum: 1 | 2,
  playerId: string,
  setActivePlayers: React.Dispatch<React.SetStateAction<any>>,
  setSelectedPlayerDropdown: React.Dispatch<React.SetStateAction<any>>
) => {
  setActivePlayers((prev: any) => {
    const prevMatch = prev[matchIndex] || {};
    const prevTeamPlayers = prevMatch[`team${teamNum}`] || [];

    // ✅ Add only if not already in list
    if (prevTeamPlayers.includes(playerId)) return prev;

    // ✅ Append at the end (keeps top-to-bottom order)
    const updatedPlayers = [...prevTeamPlayers, playerId];

    return {
      ...prev,
      [matchIndex]: {
        ...prevMatch,
        [`team${teamNum}`]: updatedPlayers
      }
    };
  });

  // ✅ Reset dropdown after selection
  setSelectedPlayerDropdown((prev: any) => ({
    ...prev,
    [matchIndex]: {
      ...prev[matchIndex],
      [teamNum]: ''
    }
  }));
};

/* --- Remove Player from Match --- */
export const removePlayerFromMatch = (
  matchIndex: number,
  teamNum: 1 | 2,
  playerId: string,
  activePlayers: any,
  setActivePlayers: any,
  playerScoresState: any,
  setPlayerScores: any,
  setSelectedPlayerDropdown: any
) => {
  setActivePlayers((prev: any) => ({
    ...prev,
    [matchIndex]: {
      ...prev[matchIndex],
      [`team${teamNum}`]: (prev[matchIndex]?.[`team${teamNum}`] || []).filter((id: string) => id !== playerId)
    }
  }));

  setPlayerScores((prev: any) => {
    const matchScores = prev[matchIndex]?.[`team${teamNum}`];
    if (!matchScores?.[playerId]) return prev;

    const newMatchScores = { ...matchScores };
    delete newMatchScores[playerId];

    return {
      ...prev,
      [matchIndex]: {
        ...prev[matchIndex],
        [`team${teamNum}`]: newMatchScores
      }
    };
  });

  setSelectedPlayerDropdown((prev: any) => ({
    ...prev,
    [matchIndex]: {
      ...prev[matchIndex],
      [teamNum]: ''
    }
  }));
};

/* --- Get Active Players for a Team --- */
export const getActivePlayersForTeam = (
  matchIndex: number,
  teamNum: 1 | 2,
  team: any,
  activePlayers: any
) => {
  if (!team?.players) return [];

  const activePlayerIds = activePlayers[matchIndex]?.[`team${teamNum}`] || [];

  return activePlayerIds
    .map((id: string) => team.players.find((p: any) => p.id === id))
    .filter(Boolean); 
};

/* --- Handle Score Changed --- */
export const handleScoreChange = (
  matchIndex: number,
  teamNum: 1 | 2,
  playerId: string,
  game: 1 | 2 | 3,
  value: string,
  setPlayerScores: any
) => {
  setPlayerScores((prev: any) => ({
    ...prev,
    [matchIndex]: {
      ...prev[matchIndex],
      [`team${teamNum}`]: {
        ...prev[matchIndex]?.[`team${teamNum}`],
        [playerId]: {
          ...prev[matchIndex]?.[`team${teamNum}`]?.[playerId],
          [`game${game}`]: value
        }
      }
    }
  }));
};

// /* --- Calculate Totals for Each Player --- */
export const calculatePlayerTotal = (playerScores: any) => {
  if (!playerScores) return 0;
  const g1 = parseInt(playerScores.game1) || 0;
  const g2 = parseInt(playerScores.game2) || 0;
  const g3 = parseInt(playerScores.game3) || 0;
  return g1 + g2 + g3;
};

/* --- Handle HDC Change --- */
export const handleHdcChange = (
  matchIndex: number,
  teamNum: 1 | 2,
  playerId: string,
  value: string,
  setPlayerScores: any
) => {
  setPlayerScores((prev: any) => ({
    ...prev,
    [matchIndex]: {
      ...prev[matchIndex],
      [`team${teamNum}`]: {
        ...prev[matchIndex]?.[`team${teamNum}`],
        [playerId]: {
          ...prev[matchIndex]?.[`team${teamNum}`]?.[playerId],
          hdc: value
        }
      }
    }
  }));
};

/* --- Handle Calculate Total With Hdc --- */
export const calculatePlayerTotalHdc = (playerScores: any) => {
  if (!playerScores) return 0;
  const total = calculatePlayerTotal(playerScores);
  const hdc = parseInt(playerScores.hdc) || 0;
  return total + hdc;
};

/* --- Handle Calculate Total Column --- */
export const calculateTeamColumnTotals = (
  teamPlayers: any[] = [],
  playerScores: any = {},
  matchIndex: number,
  teamNum: 1 | 2
) => {
  let totals = { g1: 0, g2: 0, g3: 0, hdc: 0, scratch: 0, total: 0 };

  teamPlayers.forEach((player) => {
    // Try to get from playerScores first (for editable matches)
    const playerData =
      playerScores[matchIndex]?.[`team${teamNum}`]?.[player.id] || player;

    // Use either from playerScores or direct team player data
    const g1 = Number(playerData.game1 ?? playerData.g1 ?? 0);
    const g2 = Number(playerData.game2 ?? playerData.g2 ?? 0);
    const g3 = Number(playerData.game3 ?? playerData.g3 ?? 0);
    const hdc = Number(playerData.hdc ?? 0);
    const scratch = Number(playerData.scratch ?? g1 + g2 + g3);
    const total = Number(playerData.total_hdc ?? scratch + hdc);

    totals.g1 += g1;
    totals.g2 += g2;
    totals.g3 += g3;
    totals.hdc += hdc;
    totals.scratch += scratch;
    totals.total += total;
  });

  return totals;
};

export const calculateTeamTotalsFromData = (team: any) => {
  if (!team || !team.players || team.players.length === 0) {
    return { g1: 0, g2: 0, g3: 0, scratch: 0, hdc: 0, total: 0 };
  }

  let totals = { g1: 0, g2: 0, g3: 0, scratch: 0, hdc: 0, total: 0 };

  team.players.forEach((p: any) => {
    // Ensure every value is numeric
    const g1 = Number(p.g1 || 0);
    const g2 = Number(p.g2 || 0);
    const g3 = Number(p.g3 || 0);
    const scratch = Number(p.scratch || g1 + g2 + g3);
    const hdc = Number(p.hdc || 0);
    const total = Number(p.total_hdc || scratch + hdc);

    totals.g1 += g1;
    totals.g2 += g2;
    totals.g3 += g3;
    totals.scratch += scratch;
    totals.hdc += hdc;
    totals.total += total;
  });

  return totals;
};



// export const calculateTeamTotal = (matchIndex: number, teamNum: 1 | 2, team: any, playerScoresState: any) => {
//   if (!team) return 0;
//   return team.players.reduce((sum: number, player: any) => {
//     const playerScores = playerScoresState[matchIndex]?.[`team${teamNum}`]?.[player.id];
//     return sum + calculatePlayerTotalHdc(playerScores);
//   }, 0);
// };






// /* --- API AREA --- */


// 

// 



