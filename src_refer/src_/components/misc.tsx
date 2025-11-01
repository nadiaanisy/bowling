import
  React, {
  createContext,
  ReactNode,
  useContext,
  useState
} from 'react';
// import { PASSWORD } from './data';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { BowlingContextType } from './interface';
import {
  getLeaguesByUser,
  loginUser
} from './api';
// // import { toast } from 'sonner';
// // import { supabase } from '../utils/supabaseClient';

const BowlingContext = createContext<BowlingContextType | undefined>(undefined);

export const BowlingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedLeagueName, setSelectedLeagueName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<any[]>([]);
//   // const [data, setData] = useState<BowlingData>(getInitialData());

  /* --- Auth --- */
  const login = async (
    username: string,
    password: string
  ) => {
    const user = await loginUser(username, password);
    
    if (!user) return false;

    setIsAuthenticated(true);
    setUserId(user.id);
    setUserName(user.user_name);

    sessionStorage.setItem("user_id", user.id.toString());
    sessionStorage.setItem("user_name", user.user_name);
    sessionStorage.setItem("bowling-auth", "true");

    // Fetch leagues for this user
    const leagueData = await getLeaguesByUser(user.id);
    setLeagues(leagueData);

    return true;
  }

//   // const login = (password: string) => {
//   //   if (password === PASSWORD) {
//   //     setIsAuthenticated(true);
//   //     sessionStorage.setItem("bowling-auth", "true");
//   //     localStorage.setItem("bowling-auth", "true");
//   //     return true;
//   //   }
//   //   return false;
//   // };

  const logout = () => {
    setIsAuthenticated(false);
    setSelectedLeague(null);
    setSelectedLeagueName(null);
    setUserId(null);
    setUserName(null);
    setLeagues([]);
    localStorage.clear();
    sessionStorage.clear();
  };

  /* --- League selection --- */
  const selectLeague = (league : any) => {
    setSelectedLeague(league.id);
    setSelectedLeagueName(league.name);
    sessionStorage.setItem("bowling-selected-league", league.id);
    localStorage.setItem("bowling-selected-league", league.id);
  };

//   /* --- Persist session --- */
//   useEffect(() => {
//     const authStored = sessionStorage.getItem("bowling-auth");
//     const leagueStored = sessionStorage.getItem('bowling-selected-league');
//     const userIdStored = sessionStorage.getItem("user_id");

//     if (authStored === "true" && userIdStored) {
//       setIsAuthenticated(true);
//       setUserId(Number(userIdStored));

//       // refetch leagues for persisted user
//       getLeaguesByUser(Number(userIdStored)).then(setLeagues);
//     }

//     if (leagueStored) {
//       setSelectedLeague(leagueStored);
//     }
//   }, []);

  return (
    <BowlingContext.Provider value={{
      login,
      logout,
      selectLeague,
      selectedLeagueName,
      isAuthenticated,
      selectedLeague,
      userId,
      userName,
      leagues,
    }}>
      {children}
    </BowlingContext.Provider>
  )
};

export const useBowlingHook = () => {
  const context = useContext(BowlingContext);
  if (!context) {
    throw new Error("useBowlingHook must be used within BowlingProvider");
  }
  return context;
};

export const useCustomHook = () => {
  const {
    isAuthenticated,
    selectedLeague,
    logout,
    selectLeague
  } = useBowlingHook();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  
  /* Login Related */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(''); ||   // const [error, setError] = useState<string | null>(null);

  /* Menu Related */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  /* League Selection Related */
  const [leagues, setLeagues] = useState<any[]>([]);

  /* Dashboard Related */
  const [dashboardData, setDashboardData] = useState<any>(null);

  /* Teams Related */
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [multiplePlayerNames, setMultiplePlayerNames] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  /* Timetable Related */
  const [blocksData, setBlocksData] = useState<any[]>([]);
  const [blockNumber, setBlockNumber] = useState<1 | 2>(1);
  const [week, setWeek] = useState('1');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [selectedLane, setSelectedLane] = useState<string>("");
  const [weeksAvailable, setWeeksAvailable] = useState<number[]>([]);

  /* Scores Related */
  const [scores, setScores] = useState<any>({});
  const [activePlayers, setActivePlayers] = useState<any>({});

  /* Statistics Related */
  const [selectedBlock, setSelectedBlock] = useState<'1' | '2' | 'all'>('all');
  const [selectedTeamS, setSelectedTeamS] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [players, setPlayers] = useState<any[]>([]);
  const [allScoresData, setAllScoresData] = useState<any>([]);

  return {
    isAuthenticated,
    selectedLeague,
    logout,
    selectLeague,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    setLoading,
//     error,
//     setError,
    currentPage,
    setCurrentPage,
    mobileMenuOpen,
    setMobileMenuOpen,
    leagues,
    setLeagues,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    dashboardData,
    setDashboardData,
    teams,
    setTeams,
    newTeamName,
    setNewTeamName,
    isAddingTeam,
    setIsAddingTeam,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    confirmMessage,
    setConfirmMessage,
    confirmAction,
    setConfirmAction,
    selectedTeam,
    setSelectedTeam,
    selectedTeamName,
    setSelectedTeamName,
    addMode,
    setAddMode,
    newPlayerName,
    setNewPlayerName,
    multiplePlayerNames,
    setMultiplePlayerNames,
    expandedTeams,
    setExpandedTeams,
    blocksData,
    setBlocksData,
    blockNumber,
    setBlockNumber,
    week,
    setWeek,
    team1,
    setTeam1,
    team2,
    setTeam2,
    setSelectedLane,
    selectedLane,
    weeksAvailable,
    setWeeksAvailable,
    scores,
    setScores,
    activePlayers,
    setActivePlayers,
    selectedBlock,
    setSelectedBlock,
    selectedTeamS,
    setSelectedTeamS,
    selectedWeek,
    setSelectedWeek,
    players,
    setPlayers,
    setAllScoresData,
    allScoresData
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}