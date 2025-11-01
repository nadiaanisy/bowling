import {
  checkIfLeagueHasBlocks,
  getLeaguesByUser,
  loginUser
} from './api';
import
  React, {
  createContext,
  ReactNode,
  useContext,
  useState
} from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { BowlingContextType } from './interfaces';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
};

const BowlingContext = createContext<BowlingContextType | undefined>(undefined);

export const BowlingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedLeagueName, setSelectedLeagueName] = useState<string | null>(null);
  const [hasBlock, setHasBlock] = useState<boolean>(false);

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

  //   /* --- Persist session --- */
  // useEffect(() => {
  //   const authStored = sessionStorage.getItem("bowling-auth");
  //   const leagueStored = sessionStorage.getItem('bowling-selected-league');
  //   const userIdStored = sessionStorage.getItem("user_id");

  //   if (authStored === "true" && userIdStored) {
  //     setIsAuthenticated(true);
  //     setUserId(Number(userIdStored));

  //     // refetch leagues for persisted user
  //     getLeaguesByUser(Number(userIdStored)).then(setLeagues);
  //   }

  //   if (leagueStored) {
  //     setSelectedLeague(leagueStored);
  //   }
  // }, []);

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
  const selectLeague = async (league: any) => {
    const hasBlock = await checkIfLeagueHasBlocks(league.id);
    setHasBlock(hasBlock ?? false);
    setSelectedLeagueName(league.name);
    
    if (hasBlock) {
      setSelectedLeague(league.id);
      sessionStorage.setItem("bowling-selected-league", league.id);
      localStorage.setItem("bowling-selected-league", league.id);
    }

    return hasBlock;
  };

  const changeLeague = (league: any) => {
    setSelectedLeague(null);
    setSelectedLeagueName(null);
    sessionStorage.setItem("bowling-selected-league", 'null');
    localStorage.setItem("bowling-selected-league", 'null');
  }

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
      hasBlock,
      setSelectedLeague,
      changeLeague
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
    login,
    logout,
    selectedLeagueName,
    selectedLeague,
    selectLeague,
    userId,
    hasBlock,
    setSelectedLeague,
    changeLeague
  } = useBowlingHook();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Login Related */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /* League Selection Related */
  const [leagues, setLeagues] = useState<any[]>([]);
  const [showInsertBlockDialog, setShowInsertBlockDialog] = useState(false);
  const [blockCount, setBlockCount] = useState('2');

  /* Dashboard Related */
  const [dashboardData, setDashboardData] = useState<any>(null);

  /* Teams Related */
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
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
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedStatus, setEditedStatus] = useState('active');

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
  const [weekInScores, setWeekInScores] = useState('');
  const [selectedPlayerDropdown, setSelectedPlayerDropdown] = useState<{ [matchIndex: number]: { [teamNum: number]: string } }>({});
  const [playerScores, setPlayerScores] = useState<any>({});
  const [savedMatches, setSavedMatches] = useState<number[]>([]);


  return {
    isAuthenticated,
    login,
    logout,
    selectedLeague,
    selectedLeagueName,
    selectLeague,
    userId,
    hasBlock,
    setSelectedLeague,
    changeLeague,

    currentPage,
    setCurrentPage,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    mobileMenuOpen,
    setMobileMenuOpen,
    
    username,
    setUsername,
    password,
    setPassword,
    loading,
    setLoading,

    leagues,
    setLeagues,
    showInsertBlockDialog,
    setShowInsertBlockDialog,
    blockCount,
    setBlockCount,

    dashboardData,
    setDashboardData,

    newTeamName,
    setNewTeamName,
    isAddingTeam,
    setIsAddingTeam,
    teams,
    setTeams,
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
    editingPlayer,
    setEditingPlayer,
    editedName,
    setEditedName,
    editedStatus,
    setEditedStatus,

    blockNumber,
    setBlockNumber,
    week,
    setWeek,
    team1,
    setTeam1,
    team2,
    setTeam2,
    selectedLane,
    setSelectedLane,
    blocksData,
    setBlocksData,
    weeksAvailable,
    setWeeksAvailable,

    scores,
    setScores,
    activePlayers,
    setActivePlayers,
    weekInScores,
    setWeekInScores,
    selectedPlayerDropdown,
    setSelectedPlayerDropdown,
    playerScores,
    setPlayerScores,
    savedMatches,
    setSavedMatches

  }
};