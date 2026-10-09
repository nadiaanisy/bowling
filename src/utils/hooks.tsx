import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
// // // import type {
// // //   PlayerWithTeam,
// // // } from './interfaces';
import { checkIfLeagueHasBlocks, getLeaguesByUser, loginUser } from './api/get';
import type {
  // //   ContextType,
  DashboardData,
  // //   HandicapRule,
  // //   Lane,
  League,
  // //   LeagueBlock,
  // //   LeagueTeam,
  // //   LeagueTeamWithMembers,
  // //   MatchesByBlock,
  // //   PlayerWithTeam,
  User,
} from './interfaces';

const Context = createContext<any | undefined>(undefined);

export const UseHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Hook must be used within Provider');
  }
  return context;
};

export const useCustomHook = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [Loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [CurrentPage, setCurrentPage] = useState('dashboard');
  const [MobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Landing.tsx state
  const [ShowLanding, setShowLanding] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Login.tsx state
  const [Username, setUsername] = useState('');
  const [Password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
  });
  const [signupMode, setSignupMode] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupNameError, setSignupNameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  /* SelectLeague.tsx */
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [leagueLoadError, setLeagueLoadError] = useState<string | null>(null);
  const [listOfLeaguesByUser, setListOfLeaguesByUser] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [hasBlock, setHasBlock] =
    useState<boolean>(false); /* --- League Selection State --- */
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockCount, setBlockCount] = useState('2');
  const [gamesPerWeek, setGamesPerWeek] = useState('');
  const [startingLane, setStartingLane] = useState('');
  const [totalLanes, setTotalLanes] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [selectedLeagueName, setSelectedLeagueName] = useState('');
  const [isLoadingLeagueDetails, setIsLoadingLeagueDetails] = useState(false);
  const [showCreateLeagueDialog, setShowCreateLeagueDialog] = useState(false);
  const [leagueBlockStatus, setLeagueBlockStatus] = useState<
    Record<string, boolean>
  >({});
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  const [selectedLeagueId, setSelectedLeagueId] = useState<
    string | number | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<ReactNode>('');
  const [confirmAction, setConfirmAction] = useState<
    () => void | Promise<void>
  >(() => () => undefined);
  const [creatingBlocks, setCreatingBlocks] = useState(false);
  const [creatingLeague, setCreatingLeague] = useState(false);
  const [deletingLeague, setDeletingLeague] = useState(false);
  const [playersPerGame, setPlayersPerGame] = useState('');

  // Dashboard.tsx state
  const [loadingBlockCount, setLoadingBlockCount] = useState(0);
  const [dashboardLoadError, setDashboardLoadError] = useState<string | null>(
    null,
  );
  const [dashboardReloadKey, setDashboardReloadKey] = useState(0);

  /* Stores the session expiration timer reference. */
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Checks whether the authenticated user needs to set up a league. */
  const needsLeagueSetup =
    isAuthenticated && !isLoadingLeagues && listOfLeaguesByUser.length === 0;

  /* Fetches the user's leagues and handles loading and error states. */
  const loadLeagues = async (userId: string | number) => {
    setIsLoadingLeagues(true);
    setLeagueLoadError(null);
    try {
      setListOfLeaguesByUser(await getLeaguesByUser(userId));
    } catch (err) {
      setListOfLeaguesByUser([]);
      setLeagueLoadError(
        err instanceof Error ? err.message : 'Unable to load leagues.',
      );
    } finally {
      setIsLoadingLeagues(false);
    }
  };

  /* Starts the session expiration timer and clears session data when expired. */
  const startSessionTimer = (expiresAt = Date.now() + 8 * 60 * 60 * 1000) => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    const remainingSessionTime = Math.max(0, expiresAt - Date.now());
    sessionStorage.setItem('bowling-auth-expires-at', String(expiresAt));
    sessionTimer.current = setTimeout(() => {
      setSessionExpired(true);
      setIsAuthenticated(false);
      setUserData(null);
      setListOfLeaguesByUser([]);
      setLeagueLoadError(null);
      setSelectedLeague(null);
      sessionStorage.removeItem('bowling-auth');
      sessionStorage.removeItem('bowling-user-data');
      sessionStorage.removeItem('bowling-auth-expires-at');
      sessionStorage.removeItem('bowling-previously-selected-league');
    }, remainingSessionTime);
  };

  /* Logs in the user, initializes the session, and loads their leagues. */
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const user = await loginUser(username, password);

    if (!user) return false;

    setSessionExpired(false);
    setIsAuthenticated(true);
    setUserData(user);
    sessionStorage.setItem('bowling-auth', 'true');
    sessionStorage.setItem('bowling-user-data', JSON.stringify(user));
    startSessionTimer();
    await loadLeagues(user.id);

    return true;
  };

  /* Retries loading leagues for the current user. */
  const retryLoadLeagues = async () => {
    if (userData) await loadLeagues(userData.id);
  };

  /* Restores the user's session and previously selected league on app load. */
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('bowling-auth') === 'true';
    const storedUserData = sessionStorage.getItem('bowling-user-data');
    const expiresAt = Number(sessionStorage.getItem('bowling-auth-expires-at'));
    const storedPreviouslySelectedLeague = sessionStorage.getItem(
      'bowling-previously-selected-league',
    );

    if (storedAuth && storedUserData && expiresAt > Date.now()) {
      try {
        const parsedUserData = JSON.parse(storedUserData) as User;
        setIsAuthenticated(true);
        setUserData(parsedUserData);
        startSessionTimer(expiresAt);
        void loadLeagues(parsedUserData.id);
      } catch {
        sessionStorage.clear();
      }
    } else if (storedAuth || storedUserData) {
      sessionStorage.clear();
      setSessionExpired(true);
    }

    if (storedPreviouslySelectedLeague) {
      setSelectedLeague(storedPreviouslySelectedLeague);
    }

    return () => {
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
    };
  }, []);

  /* Logs out the user and clears session data. */
  const logout = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    setSessionExpired(false);
    setIsAuthenticated(false);
    setUserData(null);
    setListOfLeaguesByUser([]);
    setLeagueLoadError(null);
    setIsLoadingLeagues(false);
    setSelectedLeague(null);
    sessionStorage.clear();
  };

  /* Selects a league and checks whether it has blocks. */
  const selectLeague = async (league: {
    id: string | number;
    hasBlocks?: boolean;
  }) => {
    const hasBlock =
      league.hasBlocks ?? (await checkIfLeagueHasBlocks(league.id));
    const leagueId = String(league.id);

    setHasBlock(hasBlock);

    if (hasBlock) {
      setDashboardData(null);
      setIsLoadingSkeleton(true);
      setSelectedLeague(leagueId);
      sessionStorage.setItem('bowling-previously-selected-league', leagueId);
    }

    return hasBlock;
  };

  /* Resets the selected league to allow the user to choose another league. */
  const changeLeague = () => {
    setSelectedLeague(null);
    sessionStorage.removeItem('bowling-previously-selected-league');
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    sessionExpired,
    setSessionExpired,
    retryLoadLeagues,
    CurrentPage,
    setCurrentPage,
    MobileMenuOpen,
    setMobileMenuOpen,

    isLoadingSkeleton,
    setIsLoadingSkeleton,
    Loading,
    setLoading,

    userData,
    setUserData,
    dashboardData,
    setDashboardData,

    /* Landing.tsx */
    ShowLanding,
    setShowLanding,
    showLearnMore,
    setShowLearnMore,
    openFaq,
    setOpenFaq,
    hoveredFeature,
    setHoveredFeature,

    /* Login.tsx */
    login,
    logout,
    Username,
    setUsername,
    Password,
    setPassword,
    showPassword,
    setShowPassword,
    fieldErrors,
    setFieldErrors,
    signupMode,
    setSignupMode,
    signupName,
    setSignupName,
    confirmPassword,
    setConfirmPassword,
    signupNameError,
    setSignupNameError,
    confirmPasswordError,
    setConfirmPasswordError,

    /* SelectLeague.tsx */
    selectLeague,
    changeLeague,
    needsLeagueSetup,
    isLoadingLeagues,
    setIsLoadingLeagues,
    leagueLoadError,
    setLeagueLoadError,
    listOfLeaguesByUser,
    setListOfLeaguesByUser,
    selectedLeague,
    setSelectedLeague,
    hasBlock,
    setHasBlock,
    showBlockDialog,
    setShowBlockDialog,
    blockCount,
    setBlockCount,
    gamesPerWeek,
    setGamesPerWeek,
    startingLane,
    setStartingLane,
    totalLanes,
    setTotalLanes,
    newLeagueName,
    setNewLeagueName,
    selectedLeagueName,
    setSelectedLeagueName,
    isLoadingLeagueDetails,
    setIsLoadingLeagueDetails,
    showCreateLeagueDialog,
    setShowCreateLeagueDialog,
    leagueBlockStatus,
    setLeagueBlockStatus,
    teamCounts,
    setTeamCounts,
    selectedLeagueId,
    setSelectedLeagueId,
    confirmOpen,
    setConfirmOpen,
    confirmMessage,
    setConfirmMessage,
    confirmAction,
    setConfirmAction,
    creatingBlocks,
    setCreatingBlocks,
    creatingLeague,
    setCreatingLeague,
    deletingLeague,
    setDeletingLeague,
    playersPerGame,
    setPlayersPerGame,

    /* Dashboard.tsx */
    loadingBlockCount,
    setLoadingBlockCount,
    dashboardLoadError,
    setDashboardLoadError,
    dashboardReloadKey,
    setDashboardReloadKey,
    retryDashboard: () => setDashboardReloadKey((key) => key + 1),
  };
};
