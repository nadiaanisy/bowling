import
  React, {
  // createContext,
  // useContext,
  // useState,
  // useEffect,
  // ReactNode
} from 'react';
import {
  // BowlingContextType,
  BowlingData,
  Team,
  Player,
  WeeklyMatch,
  Block,
  LEAGUES
} from '../others/interfaces';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabaseClient';

// const PASSWORD = 'bowling123';
// const BowlingContext = createContext<BowlingContextType | undefined>(undefined);
// const getStorageKey = (leagueId: string) => `bowling-league-${leagueId}`;

/*tengok bawah ni */
const getInitialData = (): BowlingData => ({
  teams: [],
  blocks: [
    { number: 1, matches: [] },
    { number: 2, matches: [] }
  ],
  timetable: []
});

export const BowlingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  // const [selectedLeagueName, setSelectedLeagueName] = useState<string | null>(null);
  const [data, setData] = useState<BowlingData>(getInitialData());

  // const login = (password: string) => {
  //   if (password === PASSWORD) {
  //     setIsAuthenticated(true);
  //     sessionStorage.setItem('bowling-auth', 'true');
  //     return true;
  //   }
  //   return false;
  // };

  // const logout = () => {
  //   setIsAuthenticated(false);
  //   setSelectedLeague(null);
  //   setSelectedLeagueName(null);
  //   localStorage.clear();
  //   sessionStorage.clear();
  // };

  // const selectLeague = (leagueInitial: any) => {
  //   setSelectedLeague(leagueInitial.id);
  //   setSelectedLeagueName(leagueInitial.name);
  // };


  /*TENGOK BAWAH NI NNT */
    // Load auth state on mount
  // useEffect(() => {
  //   const authStored = sessionStorage.getItem('bowling-auth');
  //   if (authStored === 'true') {
  //     setIsAuthenticated(true);
  //   }
    
  //   const leagueStored = sessionStorage.getItem('bowling-selected-league');
  //   if (leagueStored) {
  //     setSelectedLeague(leagueStored);
  //   }
  // }, []);


  // Load league data when league is selected
  // useEffect(() => {
  //   if (selectedLeague) {
  //     // localStorage.setItem('selected_league_id', selectedLeague);
  //     // const stored = localStorage.getItem(getStorageKey(selectedLeague));
  // //     if (stored) {
  // //       try {
  // //         setData(JSON.parse(stored));
  // //       } catch (e) {
  // //         console.error('Error loading data:', e);
  // //         setData(getInitialData());
  // //       }
  // //     } else {
  // //       setData(getInitialData());
  // //     }
  //   }
  // }, [selectedLeague]);

  // Save data whenever it changes
  // useEffect(() => {
  //   if (selectedLeague) {
  //     localStorage.setItem(getStorageKey(selectedLeague), JSON.stringify(data));
  //   }
  // }, [data, selectedLeague]);


  const addTimetableMatch = (week: number, team1Id: string, team2Id: string, blockNumber: 1 | 2) => {
    const team1 = data.teams.find(t => t.id === team1Id);
    const team2 = data.teams.find(t => t.id === team2Id);
    
    if (!team1 || !team2) return;

    const newMatch: WeeklyMatch = {
      week,
      team1Id,
      team2Id,
      team1Name: team1.name,
      team2Name: team2.name
    };

    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.number === blockNumber) {
          return {
            ...block,
            matches: [...block.matches, newMatch]
          };
        }
        return block;
      })
    }));
  };

  const updateMatchScores = (blockNumber: 1 | 2, weekNumber: number, matchIndex: number, team1Scores: any[], team2Scores: any[]) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.number === blockNumber) {
          const matches = [...block.matches];
          if (matches[matchIndex] && matches[matchIndex].week === weekNumber) {
            matches[matchIndex] = {
              ...matches[matchIndex],
              team1Scores,
              team2Scores
            };
          }
          return { ...block, matches };
        }
        return block;
      })
    }));
  };

  const getBlock = (blockNumber: 1 | 2): Block => {
    return data.blocks.find(b => b.number === blockNumber) || { number: blockNumber, matches: [] };
  };

  return (
    <BowlingContext.Provider value={{
      // login,
      // logout,
      // selectLeague,
      // selectedLeagueName,

      /*TENGOK BAWAH NI NNG*/
      // isAuthenticated,
      // selectedLeague,
      data,
      addTimetableMatch,
      updateMatchScores,
      getBlock
    }}>
      {children}
    </BowlingContext.Provider>
  );
};

// export const useBowlingHook = () => {
//   const context = useContext(BowlingContext);
//   if (!context) {
//     throw new Error('useBowling must be used within BowlingProvider');
//   }
//   return context;
// };

export function useCustomHook() {
  // const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  // const { isAuthenticated, selectedLeague, logout, selectLeague } = useBowlingHook();
  // const [currentPage, setCurrentPage] = useState('dashboard');
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true)
  const [teams, setTeams] = useState<any[]>([]);

  const { data } = useBowlingHook();
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [multiplePlayerNames, setMultiplePlayerNames] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [blocksData, setBlocksData] = useState<any[]>([]);
  const [blockNumber, setBlockNumber] = useState<1 | 2>(2);
  const [week, setWeek] = useState('1');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [selectedLane, setSelectedLane] = useState<string>("");
  const [block1, setBlock1] = useState<any[]>([]);
  const [block2, setBlock2] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<1 | 2>(1);

  return {
    // password,
    // setPassword,
    // error,
    // setError,
    // isAuthenticated,
    // selectedLeague,
    // logout,
    // selectLeague,
    // currentPage,
    // setCurrentPage,
    // mobileMenuOpen,
    // setMobileMenuOpen,
    leagues,
    setLeagues,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    teams,
    setTeams,
    dialogOpen,
    setDialogOpen,
    selectedTeam,
    setSelectedTeam,
    newPlayerName,
    setNewPlayerName,
    multiplePlayerNames,
    setMultiplePlayerNames,
    confirmOpen,
    setConfirmOpen,
    confirmMessage,
    setConfirmMessage,
    confirmAction,
    setConfirmAction,
    addMode,
    setAddMode,
    newTeamName,
    setNewTeamName,
    expandedTeams,
    setExpandedTeams,
    totalTeams,
    setTotalTeams,
    totalPlayers,
    setTotalPlayers,
    blocksData,
    setBlocksData,
    blockNumber,
    setBlockNumber,
    week,
    setWeek,
    team1Id,
    setTeam1Id,
    team2Id,
    setTeam2Id,
    selectedLane,
    setSelectedLane,
    block1,
    setBlock1,
    block2,
    setBlock2,
    scores,
    setScores,
    selectedWeek,
    setSelectedWeek,
    selectedBlock,
    setSelectedBlock
  };
}