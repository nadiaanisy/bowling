import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { FormEvent } from 'react';
import {
  BlockSetupDialogFormValues,
  PendingPlayerAction,
  PlayerRow,
} from './type';
import {
  checkIfLeagueHasBlocks,
  getLeaguesByUser,
  getTeamsWithMembersByLeague,
  loginUser,
} from './api/get';
import { Context } from './provider';
import {
  DashboardData,
  HandicapChangeHistory,
  HandicapSetting,
  League,
  LeagueMember,
  LeagueTeamWithMembers,
  User,
} from './interfaces';
import { TEAM_PAGE_SIZE } from './constants/teams';
import { initialLeagueSetupValues } from './constants/league';
import {
  PLAYER_DEFAULT_FILTERS,
  PLAYER_DEFAULT_STATUS,
  PLAYER_SETUP_RULE_KEYS,
} from './constants/players';
import type { PlayerRosterType } from './constants/players';
import {
  addPlayerRecordsInBulk,
  filterPlayerRows,
  openAddPlayerForm,
  openBulkAddPlayerForm,
  openEditPlayerForm,
  nonNegativeSetupNumber,
  positiveSetupNumber,
  resetPlayerForm,
  runPlayerActions,
  savePlayerRecord,
  toActivePlayerRows,
  getBowlerCategory,
} from '../functions/players';
import {
  emptyRanges,
  RangeFilters,
  SortDirection,
  SortField,
} from './constants/handicap';

const BOWLING_SESSION_STORAGE_KEYS = [
  'bowling-auth',
  'bowling-user-data',
  'bowling-auth-expires-at',
  'bowling-previously-selected-league',
] as const;

const clearBowlingSessionStorage = () => {
  BOWLING_SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
};

/* Returns the current context value and throws an error if used outside the Provider. */
export const UseHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Hook must be used within Provider');
  }
  return context;
};

/** Page-local Teams state and league-scoped team loading/filtering. */
export const useTeamsSection = () => {
  const state = UseHook();
  const {
    selectedLeague,
    searchQuery,
    setSearchQuery,
    teams,
    setTeams,
    teamsReloadKey,
    setIsLoadingTeams,
    setTeamsLoadError,
    selectedTeams,
    setSelectedTeams,
    setSelectedTeam,
    setSelectedPlayers,
    setBulkDeleteMode,
    setBulkTeamDeleteMode,
    setBulkPlayerTypeValue,
    setBulkTransferTeamId,
    setOpenTeamMenu,
    setPendingDeleteType,
    setDialogOpen,
    setBulkTeamDialogOpen,
    setEditingTeamId,
    setEditingPlayerId,
    setNewPlayerName,
    setMultiplePlayerNames,
    setMultipleTeamNames,
    setNewTeamName,
    setConfirmOpen,
  } = state;
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkArchiveConfirmOpen, setBulkArchiveConfirmOpen] = useState(false);
  const [bulkArchivingTeams, setBulkArchivingTeams] = useState(false);
  const query = searchQuery.trim().toLocaleLowerCase();
  const filteredTeams = useMemo(
    () =>
      [...teams]
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        )
        .map((team) => ({
          ...team,
          members: team.members.filter(
            (player) =>
              !player.archived_at &&
              (!query ||
                team.name.toLocaleLowerCase().includes(query) ||
                player.name.toLocaleLowerCase().includes(query)),
          ),
          shouldShow:
            !query ||
            team.name.toLocaleLowerCase().includes(query) ||
            team.members.some(
              (player) =>
                !player.archived_at &&
                player.name.toLocaleLowerCase().includes(query),
            ),
        }))
        .filter((team) => team.shouldShow)
        .map(({ shouldShow: _shouldShow, ...team }) => team),
    [teams, query],
  );
  const pageSize = TEAM_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selectedTeamRecords = teams.filter((team) =>
    selectedTeams.some((id) => String(id) === String(team.id)),
  );
  const allVisibleTeamsSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((team) =>
      selectedTeams.some((id) => String(id) === String(team.id)),
    );

  useEffect(() => setCurrentPage(1), [searchQuery, selectedLeague]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  useEffect(() => {
    setTeams([]);
    setSearchQuery('');
    setSelectedTeam(null);
    setSelectedTeams([]);
    setSelectedPlayers({});
    setBulkDeleteMode({});
    setBulkTeamDeleteMode(false);
    setBulkPlayerTypeValue({});
    setBulkTransferTeamId({});
    setOpenTeamMenu(null);
    setPendingDeleteType(null);
    setDialogOpen(false);
    setBulkTeamDialogOpen(false);
    setEditingTeamId(null);
    setEditingPlayerId(null);
    setNewPlayerName('');
    setMultiplePlayerNames('');
    setMultipleTeamNames('');
    setNewTeamName('');
    setConfirmOpen(false);
  }, [
    selectedLeague,
    setTeams,
    setSearchQuery,
    setSelectedTeam,
    setSelectedTeams,
    setSelectedPlayers,
    setBulkDeleteMode,
    setBulkTeamDeleteMode,
    setBulkPlayerTypeValue,
    setBulkTransferTeamId,
    setOpenTeamMenu,
    setPendingDeleteType,
    setDialogOpen,
    setBulkTeamDialogOpen,
    setEditingTeamId,
    setEditingPlayerId,
    setNewPlayerName,
    setMultiplePlayerNames,
    setMultipleTeamNames,
    setNewTeamName,
    setConfirmOpen,
  ]);
  useEffect(() => {
    let current = true;
    const load = async () => {
      setIsLoadingTeams(true);
      setTeamsLoadError(null);
      try {
        const rows = await getTeamsWithMembersByLeague(selectedLeague);
        if (current) setTeams(rows);
      } catch (error) {
        if (current) {
          setTeams([]);
          setTeamsLoadError(
            error instanceof Error ? error.message : 'Unable to load teams.',
          );
        }
      } finally {
        if (current) setIsLoadingTeams(false);
      }
    };
    void load();
    return () => {
      current = false;
    };
  }, [
    selectedLeague,
    teamsReloadKey,
    setTeams,
    setIsLoadingTeams,
    setTeamsLoadError,
  ]);

  return {
    currentPage,
    setCurrentPage,
    bulkArchiveConfirmOpen,
    setBulkArchiveConfirmOpen,
    bulkArchivingTeams,
    setBulkArchivingTeams,
    filteredTeams,
    totalPages,
    paginatedTeams,
    selectedTeamRecords,
    allVisibleTeamsSelected,
  };
};

/** Player page state, league-scoped data loading, and derived roster values. */
export const usePlayersSection = () => {
  const { selectedLeague, listOfLeaguesByUser, teams, setTeams } = UseHook();
  const league = listOfLeaguesByUser.find(
    (item) => String(item.id) === String(selectedLeague),
  );
  const config = (league?.setup_config ?? {}) as Record<string, unknown>;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>(
    PLAYER_DEFAULT_FILTERS.team,
  );
  const [typeFilter, setTypeFilter] = useState<string>(
    PLAYER_DEFAULT_FILTERS.rosterType,
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    PLAYER_DEFAULT_FILTERS.status,
  );
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerRow | null>(null);
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [rosterType, setRosterType] = useState<PlayerRosterType>('regular');
  const [status, setStatus] = useState<string>(PLAYER_DEFAULT_STATUS);
  const [notes, setNotes] = useState('');
  const [average, setAverage] = useState('');
  const [gender, setGender] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingPlayerAction>(null);
  const [archivedRefreshKey, setArchivedRefreshKey] = useState(0);
  const players = useMemo(() => toActivePlayerRows(teams), [teams]);
  const filteredPlayers = useMemo(
    () =>
      filterPlayerRows(players, query, teamFilter, typeFilter, statusFilter),
    [players, query, teamFilter, typeFilter, statusFilter],
  );
  const activeCount = players.filter(
    (player) => (player.status ?? 'active') === 'active',
  ).length;
  const gradedCount = players.filter(
    (player) => getBowlerCategory(player.average, config) === 'graded',
  ).length;
  const openCount = players.filter(
    (player) => getBowlerCategory(player.average, config) === 'open',
  ).length;
  const rosterMax = positiveSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.maxRosterSize,
  );
  const gradedMin = positiveSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.gradedBowlersMin,
  );
  const openMax = nonNegativeSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.openBowlersMax,
  );
  const openPerWeek = nonNegativeSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.openBowlersPerWeek,
  );
  const threshold = positiveSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.openAverageThreshold,
  );
  const minimumPlayers = positiveSetupNumber(
    config,
    PLAYER_SETUP_RULE_KEYS.minimumPlayersStart,
  );
  const playerFormSetters = {
    setName,
    setTeamId,
    setRosterType,
    setStatus,
    setNotes,
    setAverage,
    setGender,
    setBulkNames,
    setBulkMode,
    setEditing,
  };
  const resetForm = () => resetPlayerForm(playerFormSetters);
  const openAdd = () =>
    openAddPlayerForm(teams, { ...playerFormSetters, setDialogOpen });
  const openBulkAdd = () =>
    openBulkAddPlayerForm(teams, { ...playerFormSetters, setDialogOpen });
  const openEdit = (player: PlayerRow) =>
    openEditPlayerForm(player, { ...playerFormSetters, setDialogOpen });
  const reload = () => setReloadKey((value) => value + 1);
  const savePlayer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void savePlayerRecord({
      saving,
      setSaving,
      leagueId: selectedLeague,
      config,
      teams,
      rosterMax,
      editing,
      name,
      teamId,
      rosterType,
      status,
      notes,
      average,
      gender,
      setDialogOpen,
      resetForm,
      onSaved: reload,
    });
  };
  const saveBulk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void addPlayerRecordsInBulk({
      saving,
      setSaving,
      leagueId: selectedLeague,
      config,
      teams,
      rosterMax,
      teamId,
      rosterType,
      bulkNames,
      setDialogOpen,
      resetForm,
      onSaved: reload,
    });
  };
  const executePendingAction = () =>
    runPlayerActions({
      pendingAction,
      leagueId: selectedLeague,
      setTeams,
      setArchivedRefreshKey,
      setSelectedIds,
      setPendingAction,
    });

  useEffect(() => {
    let current = true;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const result = await getTeamsWithMembersByLeague(selectedLeague);
        if (current) setTeams(result);
      } catch (error) {
        if (current) {
          setTeams([]);
          setLoadError(
            error instanceof Error ? error.message : 'Unable to load players.',
          );
        }
      } finally {
        if (current) setLoading(false);
      }
    };
    void load();
    return () => {
      current = false;
    };
  }, [selectedLeague, reloadKey, setTeams]);

  return {
    selectedLeague,
    config,
    teams,
    setTeams,
    loading,
    loadError,
    query,
    setQuery,
    teamFilter,
    setTeamFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedIds,
    setSelectedIds,
    dialogOpen,
    setDialogOpen,
    editing,
    setEditing,
    name,
    setName,
    teamId,
    setTeamId,
    rosterType,
    setRosterType,
    status,
    setStatus,
    notes,
    setNotes,
    average,
    setAverage,
    gender,
    setGender,
    bulkNames,
    setBulkNames,
    bulkMode,
    setBulkMode,
    saving,
    setSaving,
    pendingAction,
    setPendingAction,
    archivedRefreshKey,
    setArchivedRefreshKey,
    reload,
    players,
    filteredPlayers,
    activeCount,
    gradedCount,
    openCount,
    rosterMax,
    gradedMin,
    openMax,
    openPerWeek,
    threshold,
    minimumPlayers,
    resetForm,
    openAdd,
    openBulkAdd,
    openEdit,
    savePlayer,
    saveBulk,
    executePendingAction,
  };
};

/* Defines a custom hook for managing shared context state. */
export const useCustomHook = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  /* Landing.tsx state */
  const [showLanding, setShowLanding] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  /* Login.tsx state */
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
  const [hasBlock, setHasBlock] = useState<boolean>(false);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<BlockSetupDialogFormValues>({
    ...initialLeagueSetupValues,
    season_name: '2026/27',
    games_per_week: '3',
    players_per_game: '5',
    total_lanes: '32',
    starting_lane: '1',
  });
  const [saveError, setSaveError] = useState('');
  const mainRef = useRef<HTMLElement | null>(null);
  const [savingStep, setSavingStep] = useState(false);
  const [savedSteps, setSavedSteps] = useState<number[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHasChanges, setPreviewHasChanges] = useState(false);
  const [resumePending, setResumePending] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [rejectedInputErrors, setRejectedInputErrors] = useState<
    Record<string, string>
  >({});

  /* Dashboard.tsx */
  const [loadingBlockCount, setLoadingBlockCount] = useState(0);
  const [dashboardLoadError, setDashboardLoadError] = useState<string | null>(
    null,
  );
  const [dashboardReloadKey, setDashboardReloadKey] = useState(0);

  /* Handicap.tsx */
  const [rules, setRules] = useState<HandicapSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<
    Array<string | number>
  >([]);
  const [editingRule, setEditingRule] = useState<HandicapSetting | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<HandicapSetting | null>(
    null,
  );
  const [average, setAverage] = useState('');
  const [handicap, setHandicap] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [menHandicap, setMenHandicap] = useState('');
  const [womenHandicap, setWomenHandicap] = useState('');
  const [menMaxHandicap, setMenMaxHandicap] = useState('0');
  const [womenMaxHandicap, setWomenMaxHandicap] = useState('0');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('average');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [ranges, setRanges] = useState<RangeFilters>(emptyRanges);
  const [historyRows, setHistoryRows] = useState<HandicapChangeHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  /* Teams.tsx */
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [bulkTeamDialogOpen, setBulkTeamDialogOpen] = useState(false);
  const [multipleTeamNames, setMultipleTeamNames] = useState('');
  const [creatingTeams, setCreatingTeams] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [updatingTeam, setUpdatingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | number | null>(
    null,
  );
  const [editingTeamName, setEditingTeamName] = useState('');
  const [editingTeamNotes, setEditingTeamNotes] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<Array<string | number>>(
    [],
  );
  const [bulkTeamDeleteMode, setBulkTeamDeleteMode] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState(false);
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [updatingPlayer, setUpdatingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<
    string | number | null
  >(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [editingPlayerStatus, setEditingPlayerStatus] = useState('');
  const [editingPlayerType, setEditingPlayerType] = useState<
    'regular' | 'substitute'
  >('regular');
  const [editingPlayerNotes, setEditingPlayerNotes] = useState('');
  const [teams, setTeams] = useState<LeagueTeamWithMembers[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamsLoadError, setTeamsLoadError] = useState<string | null>(null);
  const [teamsReloadKey, setTeamsReloadKey] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<string | number | null>(
    null,
  );
  const [newPlayerName, setNewPlayerName] = useState('');
  const [multiplePlayerNames, setMultiplePlayerNames] = useState('');
  const [playerType, setPlayerType] = useState<'regular' | 'substitute'>(
    'regular',
  );

  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, Array<string | number>>
  >({});
  const [bulkDeleteMode, setBulkDeleteMode] = useState<Record<string, boolean>>(
    {},
  );
  const [bulkPlayerTypeValue, setBulkPlayerTypeValue] = useState<
    Record<string, 'regular' | 'substitute'>
  >({});
  const [bulkTransferTeamId, setBulkTransferTeamId] = useState<
    Record<string, string>
  >({});
  const [bulkUpdatingPlayers, setBulkUpdatingPlayers] = useState(false);
  const [openTeamMenu, setOpenTeamMenu] = useState<string | null>(null);
  const [pendingDeleteType, setPendingDeleteType] = useState<
    'team' | 'teams' | 'player' | 'players' | null
  >(null);
  const [archivingTeamId, setArchivingTeamId] = useState<
    string | number | null
  >(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archivedTeamsRefreshKey, setArchivedTeamsRefreshKey] = useState(0);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [playerToArchive, setPlayerToArchive] = useState<LeagueMember | null>(
    null,
  );
  const [archivingPlayerId, setArchivingPlayerId] = useState<
    string | number | null
  >(null);
  const [archivedPlayersRefreshKey, setArchivedPlayersRefreshKey] = useState(0);
  const [playersDialogOpen, setPlayersDialogOpen] = useState(false);

  /* Stores the session expiration timer reference. */
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Checks whether the authenticated user needs to set up a league. */
  // const needsLeagueSetup =
  //   isAuthenticated && !isLoadingLeagues && listOfLeaguesByUser.length === 0;

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

    if (storedAuth && storedUserData && expiresAt > Date.now()) {
      try {
        const parsedUserData = JSON.parse(storedUserData) as User;
        setIsAuthenticated(true);
        setUserData(parsedUserData);
        startSessionTimer(expiresAt);
        void loadLeagues(parsedUserData.id);
      } catch {
        clearBowlingSessionStorage();
        setIsAuthenticated(false);
        setUserData(null);
        setSelectedLeague(null);
      }
    } else if (storedAuth || storedUserData) {
      clearBowlingSessionStorage();
      setSessionExpired(true);
      setIsAuthenticated(false);
      setUserData(null);
      setSelectedLeague(null);
    }

    return () => {
      if (sessionTimer.current) {
        clearTimeout(sessionTimer.current);
      }
    };
  }, []);

  /* Validates the previously selected league after the user's leagues load. */
  useEffect(() => {
    if (!isAuthenticated || isLoadingLeagues || leagueLoadError !== null) {
      return;
    }

    const storedLeagueId = sessionStorage.getItem(
      'bowling-previously-selected-league',
    );

    if (!storedLeagueId) return;

    const storedLeague = listOfLeaguesByUser.find(
      (league) => String(league.id) === storedLeagueId,
    );

    if (!storedLeague) {
      sessionStorage.removeItem('bowling-previously-selected-league');
      setSelectedLeague(null);
      return;
    }

    setSelectedLeague(String(storedLeague.id));
  }, [isAuthenticated, isLoadingLeagues, leagueLoadError, listOfLeaguesByUser]);

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
    setUsername('');
    setPassword('');
    clearBowlingSessionStorage();
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
    currentPage,
    setCurrentPage,
    mobileMenuOpen,
    setMobileMenuOpen,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    loading,
    setLoading,
    userData,
    setUserData,
    dashboardData,
    setDashboardData,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    changeLeague,
    selectLeague,

    /* Landing.tsx */
    showLanding,
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
    isLoadingLeagues,
    setIsLoadingLeagues,
    listOfLeaguesByUser,
    setListOfLeaguesByUser,
    leagueLoadError,
    setLeagueLoadError,
    selectedLeague,
    setSelectedLeague,
    hasBlock,
    setHasBlock,
    selectedLeagueName,
    setSelectedLeagueName,
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
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    editingLeague,
    setEditingLeague,
    step,
    setStep,
    values,
    setValues,
    saveError,
    setSaveError,
    mainRef,
    savingStep,
    setSavingStep,
    savedSteps,
    setSavedSteps,
    previewMode,
    setPreviewMode,
    previewHasChanges,
    setPreviewHasChanges,
    resumePending,
    setResumePending,
    touchedFields,
    setTouchedFields,
    rejectedInputErrors,
    setRejectedInputErrors,

    /* Dashboard.tsx */
    loadingBlockCount,
    setLoadingBlockCount,
    dashboardLoadError,
    setDashboardLoadError,
    dashboardReloadKey,
    setDashboardReloadKey,
    retryDashboard: () => setDashboardReloadKey((key) => key + 1),

    /* Handicap.tsx */
    rules,
    setRules,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    bulkDialogOpen,
    setBulkDialogOpen,
    bulkInput,
    setBulkInput,
    bulkFileName,
    setBulkFileName,
    bulkError,
    setBulkError,
    selectedRuleIds,
    setSelectedRuleIds,
    editingRule,
    setEditingRule,
    ruleToDelete,
    setRuleToDelete,
    average,
    setAverage,
    handicap,
    setHandicap,
    isSaving,
    setIsSaving,
    menHandicap,
    setMenHandicap,
    womenHandicap,
    setWomenHandicap,
    menMaxHandicap,
    setMenMaxHandicap,
    womenMaxHandicap,
    setWomenMaxHandicap,
    isSavingConfig,
    setIsSavingConfig,
    search,
    setSearch,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    ranges,
    setRanges,
    historyRows,
    setHistoryRows,
    historyLoading,
    setHistoryLoading,
    historyError,
    setHistoryError,
    backupMenuOpen,
    setBackupMenuOpen,
    addMenuOpen,
    setAddMenuOpen,

    /* Teams.tsx */
    newTeamName,
    setNewTeamName,
    creatingTeam,
    setCreatingTeam,
    deletingTeam,
    setDeletingTeam,
    updatingTeam,
    setUpdatingTeam,
    editingTeamId,
    setEditingTeamId,
    editingTeamName,
    setEditingTeamName,
    editingTeamNotes,
    setEditingTeamNotes,
    selectedTeams,
    setSelectedTeams,
    bulkTeamDeleteMode,
    setBulkTeamDeleteMode,
    deletingPlayer,
    setDeletingPlayer,
    creatingPlayer,
    setCreatingPlayer,
    updatingPlayer,
    setUpdatingPlayer,
    editingPlayerId,
    setEditingPlayerId,
    editingPlayerName,
    setEditingPlayerName,
    editingPlayerStatus,
    setEditingPlayerStatus,
    editingPlayerType,
    setEditingPlayerType,
    editingPlayerNotes,
    setEditingPlayerNotes,
    teams,
    setTeams,
    isLoadingTeams,
    setIsLoadingTeams,
    teamsLoadError,
    setTeamsLoadError,
    teamsReloadKey,
    retryTeams: () => setTeamsReloadKey((key) => key + 1),
    selectedTeam,
    setSelectedTeam,
    newPlayerName,
    setNewPlayerName,
    multiplePlayerNames,
    setMultiplePlayerNames,
    playerType,
    setPlayerType,
    addMode,
    setAddMode,
    expandedTeams,
    setExpandedTeams,
    selectedPlayers,
    setSelectedPlayers,
    bulkDeleteMode,
    setBulkDeleteMode,
    bulkPlayerTypeValue,
    setBulkPlayerTypeValue,
    bulkTransferTeamId,
    setBulkTransferTeamId,
    bulkUpdatingPlayers,
    setBulkUpdatingPlayers,
    openTeamMenu,
    setOpenTeamMenu,
    pendingDeleteType,
    setPendingDeleteType,
    bulkTeamDialogOpen,
    setBulkTeamDialogOpen,
    multipleTeamNames,
    setMultipleTeamNames,
    creatingTeams,
    setCreatingTeams,
    archivingTeamId,
    setArchivingTeamId,
    archiveDialogOpen,
    setArchiveDialogOpen,
    archivedTeamsRefreshKey,
    setArchivedTeamsRefreshKey,
    archiveError,
    setArchiveError,
    playerToArchive,
    setPlayerToArchive,
    archivingPlayerId,
    setArchivingPlayerId,
    archivedPlayersRefreshKey,
    setArchivedPlayersRefreshKey,
    playersDialogOpen,
    setPlayersDialogOpen,
  };
};
