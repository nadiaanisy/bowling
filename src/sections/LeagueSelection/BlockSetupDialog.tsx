import React, { useEffect } from 'react';
import type {
  BlockSetupDialogField,
  BlockSetupDialogFormValues,
} from '../../utils/type';
import { useCustomHook } from '../../utils/hooks';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import {
  getLeagueSetupFieldHelp,
  handleLeagueSetup,
  updateLeagueSetupField,
} from '../../functions/league';
import {
  saveLeagueSetupProgress,
  saveLeagueStructureDraft,
  updateLeagueStructure,
} from '../../utils/api/update';
import type { League } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
Dialog,
DialogContent
} from '../../components/dialog';
import {
  errorToastStyle,
  successToastStyle,
} from '../../functions/toast-styles';
import {
  leagueSetupFieldHelp,
  leagueSetupFields,
  leagueSetupGroups,
  leagueSetupSections,
  initialLeagueSetupValues,
} from '../../utils/constants/league';
import {
  bakerEventFields,
  finalHandicapAwardDependency,
  finalPrizeFields,
  handicapSettingFields,
  jackpotEventFields,
  perfectGamePrizeFields,
  scotchEventFields,
  weeklyPrizeFields,
} from '../../utils/constants/league';
import { toast } from 'sonner';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleCheck,
  ClipboardList,
  Crown,
  Layers,
  Loader2,
  X,
} from 'lucide-react';

function FieldHelp({ field }: { field: BlockSetupDialogField }) {
  const description = getLeagueSetupFieldHelp(field, leagueSetupFieldHelp);
  const tooltipId = `field-help-${field.key}`;

  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={`Help for ${field.label}`}
        aria-describedby={tooltipId}
        className="rounded-full text-slate-500 outline-none transition hover:text-fuchsia-300 focus-visible:text-fuchsia-300"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-[80] mt-2 w-56 max-w-[calc(100vw-3rem)] rounded-lg border border-fuchsia-400/20 bg-[#171222] p-2.5 text-left text-[11px] leading-relaxed text-slate-200 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {description}
      </span>
    </span>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeagueName: string;
  selectedLeagueId: string | number | null;
  selectedLeague: League | null;
  blockCount: string;
  setBlockCount: (value: string) => void;
  gamesPerWeek: string;
  setGamesPerWeek: (value: string) => void;
  playersPerGame: string;
  setPlayersPerGame: (value: string) => void;
  startingLane: string;
  setStartingLane: (value: string) => void;
  totalLanes: string;
  setTotalLanes: (value: string) => void;
  creatingBlocks: boolean;
  setCreatingBlocks: (value: boolean) => void;
  setLeagueBlockStatus: React.Dispatch<
    React.SetStateAction<Record<string | number, boolean>>
  >;
  setListOfLeaguesByUser: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function BlockSetupDialog(props: Props) {
  const {
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
  } = useCustomHook();

  useEffect(() => {
    if (props.open) {
      setSaveError('');
      setSavingStep(false);
      setPreviewMode(false);
      setPreviewHasChanges(false);
      setTouchedFields({});
      setRejectedInputErrors({});
      const savedConfig = props.selectedLeague?.setup_config ?? {};
      const restoredValues = Object.fromEntries(
        Object.entries(savedConfig)
          .filter(([key]) => !key.startsWith('_'))
          .map(([key, value]) => [
            key,
            typeof value === 'boolean'
              ? value
              : value === null || value === undefined
                ? ''
                : String(value),
          ]),
      ) as BlockSetupDialogFormValues;
      const storedSteps = Array.isArray(savedConfig._savedSteps)
        ? savedConfig._savedSteps.filter(
            (savedStep): savedStep is number =>
              Number.isInteger(savedStep) && savedStep >= 0 && savedStep < 8,
          )
        : [];
      const unsavedToggleDefaults = Object.fromEntries(
        leagueSetupGroups.flatMap((stepGroups, stepIndex) =>
          storedSteps.includes(stepIndex)
            ? []
            : stepGroups
                .flatMap((group) => group.fields)
                .filter(
                  (field) => field.type === 'toggle' || field.type === 'check',
                )
                .map((field) => [field.key, false]),
        ),
      ) as Partial<BlockSetupDialogFormValues>;
      const hasLegacyStructure = Boolean(
        props.selectedLeague?.season_name &&
        Number(props.selectedLeague?.number_of_teams) > 0 &&
        Number(props.selectedLeague?.number_of_blocks) > 0,
      );
      setSavedSteps(
        storedSteps.length > 0 ? storedSteps : hasLegacyStructure ? [0] : [],
      );
      setValues({
        ...initialLeagueSetupValues,
        ...restoredValues,
        ...unsavedToggleDefaults,
        ...(!storedSteps.includes(2)
          ? {
              max_roster_size: '',
              graded_bowlers_min: '',
              open_bowlers_max: '',
              open_bowlers_per_week: '',
              allow_open_bowlers: false,
              open_average_threshold: '',
              minimum_players_start: '',
              minimum_games_qualify: '',
              minimum_series_by_deadline: '',
              eligibility_deadline_week: '',
              allow_national_elite: false,
              allow_substitutes: false,
              addition_round: false,
              new_player_handicap: '',
            }
          : {}),
        ...(!storedSteps.includes(3)
          ? {
              team_win_points: '0',
              team_loss_points: '0',
              team_tie_points: '0',
              game_win_points: '0',
              series_win_points: '0',
              team_high_series: false,
              team_above_average: false,
              individual_high_game: false,
              individual_high_series: false,
              enable_peterson: false,
              peterson_points: '0',
            }
          : {}),
        ...(!storedSteps.includes(4)
          ? {
              enable_handicap: false,
              calculation_method: '',
              base_average: '0',
              handicap_percentage: '0',
              games_for_average: '0',
              men_maximum: '0',
              ladies_maximum: '0',
              round_handicap: false,
              promote_handicap: false,
            }
          : {}),
        ...(!storedSteps.includes(5)
          ? {
              award_perfect_game: false,
              perfect_game_round1_prize: '',
              perfect_game_round2_prize: '',
              perfect_game_share_winners: false,
              perfect_game_carry_forward: false,
              award_double_perfect: false,
              award_high_game: false,
              award_high_series: false,
              award_high_handicap: false,
              award_individual_high_series_handicap: false,
              award_team_high_game_handicap: false,
              award_team_series: false,
              award_weekly: false,
              weekly_individual_high_game_hcp_games: '0',
              weekly_individual_high_series_hcp_games: '0',
              weekly_team_high_game_hcp_games: '0',
              weekly_team_high_series_hcp_games: '0',
              award_final: false,
              final_champion_prize: '',
              final_second_place_prize: '',
              final_third_place_prize: '',
              final_fourth_place_prize: '',
              final_fifth_place_prize: '',
              final_sixth_place_prize: '',
              final_seventh_place_prize: '',
              final_eighth_place_prize: '',
              final_ninth_place_prize: '',
              final_10_to_20_prize: '',
              final_21_to_31_prize: '',
              final_team_high_series_hcp_prize: '',
              final_team_high_game_hcp_prize: '',
              final_individual_high_series_hcp_prize: '',
              final_individual_high_game_hcp_prize: '',
              award_minimum_games: '0',
              prize_list_deadline_weeks: '0',
              multiple_awards: false,
              high_series_priority: false,
              tie_handling: '',
            }
          : {}),
        ...(!storedSteps.includes(6)
          ? {
              scotch_doubles: false,
              scotch_max_pairs: '',
              scotch_games: '',
              scotch_entry_fee: '',
              scotch_qualification: '',
              team_bakers: false,
              baker_bowlers: '',
              baker_games: '',
              baker_start_time: '',
              baker_entry_fee: '',
              baker_winning_basis: '',
              baker_change_bowler_each_game: false,
              baker_keep_remaining_order: false,
              baker_tie_handling: '',
              baker_champion_prize: '',
              baker_second_place_prize: '',
              baker_third_place_prize: '',
              baker_fourth_place_prize: '',
              baker_fifth_place_prize: '',
              baker_sixth_place_prize: '',
              baker_7_to_10_prize: '',
              baker_11_to_31_prize: '',
              jackpot: false,
              jackpot_contribution: '',
              jackpot_carry_forward: false,
              jackpot_carry_forward_amount: '',
            }
          : {}),
        ...(!storedSteps.includes(7)
          ? {
              walkover_deduction: '0',
              walkover_rule: '',
              walkover_target_required: false,
              walkover_unmet_target_peterson_counts: false,
              walkover_team_peterson_only: false,
              forfeit_rule: '',
              blind_score: '0',
              no_joining_after_frame: false,
              review_handicap: false,
              public_holiday: false,
              blind_fees_forfeited: false,
              postponement_limit: '0',
              junior_postponement_limit: '0',
              postponement_notice_day: '',
              postponement_notice_time: '',
              postponement_notice_channel: '',
              postponement_notice_parties: '',
              post_bowl_cutoff_day: '',
              no_post_bowl_walkover_week: '0',
              no_postponements_week: '0',
              allow_pre_bowl_restricted_week: false,
              fasting_month_rule: false,
              dong_code: '',
            }
          : {}),
        season_name: props.selectedLeague?.season_name ?? '',
        league_format:
          (props.selectedLeague?.league_format ?? 'head_to_head') ===
          'head_to_head'
            ? 'Head to Head'
            : String(props.selectedLeague?.league_format ?? 'Head to Head'),
        number_of_weeks: String(props.selectedLeague?.number_of_weeks ?? ''),
        number_of_teams: String(props.selectedLeague?.number_of_teams ?? ''),
        number_of_blocks: String(
          props.selectedLeague?.number_of_blocks ?? props.blockCount ?? '',
        ),
        games_per_week: String(
          props.selectedLeague?.games_per_week ?? props.gamesPerWeek ?? '',
        ),
        players_per_game: String(
          props.selectedLeague?.players_per_game ?? props.playersPerGame ?? '',
        ),
        starting_lane: String(
          props.selectedLeague?.starting_lane ?? props.startingLane ?? '',
        ),
        total_lanes: String(
          props.selectedLeague?.total_lanes ?? props.totalLanes ?? '',
        ),
      });
      setResumePending(true);
    }
  }, [props.open, props.selectedLeagueId]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [step, props.open]);

  const update = (key: string, value: string | boolean) =>
    updateLeagueSetupField({
      key,
      value,
      previewMode,
      groups: leagueSetupGroups,
      setPreviewHasChanges,
      setSavedSteps,
      setTouchedFields,
      setRejectedInputErrors,
      setValues,
    });

  const roundsForSchedule = Number(values.number_of_blocks);
  const actualTeamCount = Number(values.number_of_teams);
  const fullTeamCount =
    Number.isSafeInteger(actualTeamCount) && actualTeamCount > 0
      ? actualTeamCount + (actualTeamCount % 2)
      : 0;
  const calculatedWeeks =
    Number.isSafeInteger(roundsForSchedule) &&
    roundsForSchedule > 0 &&
    fullTeamCount > 1 &&
    Number.isSafeInteger(roundsForSchedule * (fullTeamCount - 1))
      ? roundsForSchedule * (fullTeamCount - 1)
      : null;
  const commencementDateParts = String(values.commencement_date ?? '')
    .split('-')
    .map(Number);
  const calculatedEndDate = (() => {
    if (
      calculatedWeeks === null ||
      commencementDateParts.length !== 3 ||
      commencementDateParts.some((part) => !Number.isInteger(part))
    ) {
      return null;
    }

    const [year, month, day] = commencementDateParts;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    date.setUTCDate(date.getUTCDate() + (calculatedWeeks - 1) * 7);
    return date.toISOString().slice(0, 10);
  })();

  const sectionCompletion = leagueSetupSections.slice(0, 8).map((_, index) => {
    const fields = leagueSetupGroups[index].flatMap((group) => group.fields);
    if (index === 0) {
      const isFilled = fields.every((field) =>
        field.key === 'number_of_weeks'
          ? calculatedWeeks !== null
          : String(values[field.key] ?? '').trim() !== '',
      );
      const numericFields = fields.filter((field) => field.type === 'number');
      const hasValidNumbers = numericFields.every((field) => {
        const value =
          field.key === 'number_of_weeks'
            ? calculatedWeeks
            : Number(values[field.key]);
        return value !== null && Number.isSafeInteger(value) && value > 0;
      });
      const blockCount = Number(values.number_of_blocks);
      const teamCount = Number(values.number_of_teams);
      const startingLane = Number(values.starting_lane);
      const totalLanes = Number(values.total_lanes);
      const scheduledTeamCount = teamCount + (teamCount % 2);
      const availableLanes = totalLanes - startingLane + 1;

      return (
        isFilled &&
        hasValidNumbers &&
        blockCount <= 10 &&
        startingLane <= totalLanes &&
        availableLanes >= scheduledTeamCount
      );
    }

    const required = fields.filter(
      (field) =>
        field.required && !(index === 4 && !Boolean(values.enable_handicap)),
    );
    return (
      required.length === 0 ||
      required.every((field) =>
        field.key === 'schedule_weeks'
          ? calculatedWeeks !== null
          : field.key === 'end_date'
            ? calculatedEndDate !== null
            : String(values[field.key] ?? '').trim() !== '',
      )
    );
  });
  const completedSections = sectionCompletion.map(
    (isComplete, index) =>
      isComplete && (index === 0 || savedSteps.includes(index)),
  );
  const canOpenStepFromSidebar = (targetStep: number) => {
    if (targetStep === 0) {
      return sectionCompletion[0] && savedSteps.includes(0);
    }
    return sectionCompletion
      .slice(0, targetStep)
      .every((isComplete, index) => isComplete && savedSteps.includes(index));
  };
  const completion = [...completedSections, completedSections.every(Boolean)];
  const completedCount = completion.filter(Boolean).length;
  const progress = Math.round(
    (completedCount / leagueSetupSections.length) * 100,
  );

  useEffect(() => {
    if (!props.open || !resumePending) return;
    const firstIncompleteStep = completion
      .slice(0, 8)
      .findIndex((isComplete) => !isComplete);
    setStep(firstIncompleteStep < 0 ? 8 : firstIncompleteStep);
    setResumePending(false);
  }, [props.open, resumePending, completion]);

  const setupFieldKeys = new Set([
    ...leagueSetupFields.map((field) => field.key),
    'league_day',
    'commencement_date',
    'end_date',
    'schedule_weeks',
    'practice_time',
    'game_start_time',
    'late_cutoff',
  ]);
  const getFieldError = (field: BlockSetupDialogField): string | null => {
    if (!setupFieldKeys.has(field.key)) return null;
    if (rejectedInputErrors[field.key]) return rejectedInputErrors[field.key];
    if (
      field.key === 'end_date' &&
      touchedFields.commencement_date &&
      calculatedEndDate === null
    ) {
      return 'Choose a commencement date to calculate the end date.';
    }
    if (!touchedFields[field.key]) {
      if (
        (field.key === 'number_of_weeks' || field.key === 'schedule_weeks') &&
        (touchedFields.number_of_blocks || touchedFields.number_of_teams) &&
        calculatedWeeks === null
      ) {
        return 'Enter valid rounds and team count to calculate weeks.';
      }
      return null;
    }

    const rawValue = String(values[field.key] ?? '').trim();
    if (field.key === 'end_date') {
      return calculatedEndDate === null
        ? 'Choose a commencement date to calculate the end date.'
        : null;
    }
    if (field.key === 'number_of_weeks' || field.key === 'schedule_weeks') {
      return calculatedWeeks === null
        ? 'Enter valid rounds and team count to calculate weeks.'
        : null;
    }
    if (!rawValue) return 'This field is required.';
    if (field.type !== 'number') return null;

    const numericValue = Number(rawValue);
    if (!Number.isSafeInteger(numericValue)) {
      return 'Enter a whole number.';
    }
    const zeroAllowedScoringFields = [
      'team_win_points',
      'team_loss_points',
      'team_tie_points',
      'game_win_points',
      'series_win_points',
      'peterson_points',
    ];
    if (numericValue < (zeroAllowedScoringFields.includes(field.key) ? 0 : 1)) {
      return zeroAllowedScoringFields.includes(field.key)
        ? 'Enter zero or a positive whole number.'
        : 'Enter a number greater than zero.';
    }
    if (field.key === 'number_of_blocks' && numericValue > 10) {
      return 'The number of rounds cannot be greater than 10.';
    }
    if (
      field.key === 'starting_lane' &&
      Number.isSafeInteger(Number(values.total_lanes)) &&
      numericValue > Number(values.total_lanes)
    ) {
      return 'Starting lane cannot exceed total lanes.';
    }
    if (field.key === 'starting_lane') {
      const teamCount = Number(values.number_of_teams);
      const totalLanes = Number(values.total_lanes);
      if (
        Number.isSafeInteger(teamCount) &&
        teamCount > 0 &&
        Number.isSafeInteger(totalLanes) &&
        totalLanes > 0
      ) {
        const scheduledTeamCount = teamCount + (teamCount % 2);
        const availableLanes = totalLanes - numericValue + 1;
        if (availableLanes < scheduledTeamCount) {
          return `Starting at lane ${numericValue} leaves ${availableLanes} lane${availableLanes === 1 ? '' : 's'} for ${scheduledTeamCount} scheduled teams${teamCount % 2 === 1 ? ' including the Blind team' : ''}.`;
        }
      }
    }
    if (
      field.key === 'total_lanes' &&
      Number.isSafeInteger(Number(values.starting_lane)) &&
      numericValue < Number(values.starting_lane)
    ) {
      return 'Total lanes must be at least the starting lane.';
    }

    return null;
  };

  const saveStepAndGo = async (targetStep: number, fromSidebar = false) => {
    if (savingStep || props.creatingBlocks || targetStep === step) return;
    if (fromSidebar) {
      if (!canOpenStepFromSidebar(targetStep)) return;
      setStep(targetStep);
      setPreviewMode(true);
      setSaveError('');
      return;
    }
    if (step >= 8) {
      setStep(targetStep);
      return;
    }
    if (props.selectedLeagueId === null) {
      setSaveError('Select a league before saving setup.');
      toast.error(
        'Unable to save setup: no league is selected.',
        errorToastStyle,
      );
      return;
    }
    if (targetStep > step && !sectionCompletion[step]) {
      setSaveError(
        `Complete every required field in Step ${step + 1} before continuing.`,
      );
      return;
    }

    setSavingStep(true);
    setSaveError('');
    const nextSavedSteps = sectionCompletion[step]
      ? Array.from(new Set([...savedSteps, step])).sort((a, b) => a - b)
      : savedSteps;
    const setupConfig: Record<string, unknown> = {
      ...values,
      number_of_weeks: calculatedWeeks ?? '',
      schedule_weeks: calculatedWeeks ?? '',
      end_date: calculatedEndDate ?? '',
      _savedSteps: nextSavedSteps,
    };

    try {
      const updatedAt =
        step === 0
          ? await saveLeagueStructureDraft(
              props.selectedLeagueId,
              {
                season_name: String(values.season_name).trim(),
                league_format: String(values.league_format)
                  .toLowerCase()
                  .replace(' ', '_'),
                number_of_weeks: calculatedWeeks ?? 0,
                number_of_teams: Number(values.number_of_teams),
                number_of_blocks: Number(values.number_of_blocks),
                games_per_week: Number(values.games_per_week),
                players_per_game: Number(values.players_per_game),
                starting_lane: Number(values.starting_lane),
                total_lanes: Number(values.total_lanes),
              },
              setupConfig,
            )
          : await saveLeagueSetupProgress(props.selectedLeagueId, setupConfig);

      if (!updatedAt) {
        setSaveError(`Unable to save Step ${step + 1}. Please try again.`);
        return;
      }

      setSavedSteps(nextSavedSteps);
      props.setListOfLeaguesByUser((current) =>
        current.map((league) =>
          league.id === props.selectedLeagueId
            ? {
                ...league,
                updated_at: updatedAt,
                setup_config: setupConfig,
                ...(step === 0
                  ? {
                      season_name: String(values.season_name).trim(),
                      league_format: String(values.league_format)
                        .toLowerCase()
                        .replace(' ', '_'),
                      number_of_weeks: calculatedWeeks ?? 0,
                      number_of_teams: Number(values.number_of_teams),
                      number_of_blocks: Number(values.number_of_blocks),
                      games_per_week: Number(values.games_per_week),
                      players_per_game: Number(values.players_per_game),
                      starting_lane: Number(values.starting_lane),
                      total_lanes: Number(values.total_lanes),
                    }
                  : {}),
              }
            : league,
        ),
      );
      toast.success(`Step ${step + 1} saved.`, successToastStyle);
      setPreviewMode(false);
      setPreviewHasChanges(false);
      setStep(targetStep);
    } catch (error) {
      console.error(`Unable to save setup step ${step + 1}:`, error);
      setSaveError(`Unable to save Step ${step + 1}. Please try again.`);
      toast.error(`Unable to save Step ${step + 1}.`, errorToastStyle);
    } finally {
      setSavingStep(false);
    }
  };

  const save = () => {
    if (props.creatingBlocks) return;
    const incompleteStep = completion
      .slice(0, 8)
      .findIndex((isComplete) => !isComplete);
    if (incompleteStep >= 0) {
      setSaveError(
        'Complete the required fields in each section before activation.',
      );
      setStep(incompleteStep);
      return;
    }
    const toPositiveWhole = (key: string) => {
      if (key === 'number_of_weeks') return calculatedWeeks ?? NaN;
      const raw = String(values[key] ?? '').trim();
      return /^\d+$/.test(raw) ? Number(raw) : NaN;
    };
    const blocks = toPositiveWhole('number_of_blocks');
    const games = toPositiveWhole('games_per_week');
    const players = toPositiveWhole('players_per_game');
    const lane = toPositiveWhole('starting_lane');
    const lanes = toPositiveWhole('total_lanes');
    const structure = [
      'season_name',
      'number_of_blocks',
      'number_of_weeks',
      'number_of_teams',
    ];
    if (
      String(values.season_name ?? '').trim() === '' ||
      structure
        .slice(1)
        .some(
          (key) =>
            !Number.isInteger(toPositiveWhole(key)) || toPositiveWhole(key) < 1,
        )
    ) {
      setSaveError(
        'Complete the required League Structure fields before activation.',
      );
      setStep(0);
      return;
    }
    if (
      ![blocks, games, players, lane, lanes].every(
        (number) => Number.isInteger(number) && number > 0,
      ) ||
      blocks > 10 ||
      lane > lanes
    ) {
      setSaveError(
        'Check the bowling setup values. Blocks must be 1–10 and starting lane cannot exceed total lanes.',
      );
      setStep(0);
      return;
    }
    props.setBlockCount(String(blocks));
    props.setGamesPerWeek(String(games));
    props.setPlayersPerGame(String(players));
    props.setStartingLane(String(lane));
    props.setTotalLanes(String(lanes));
    void handleLeagueSetup(
      props.creatingBlocks,
      props.setCreatingBlocks,
      props.selectedLeagueId,
      String(blocks),
      String(games),
      String(players),
      String(lane),
      String(lanes),
      props.setLeagueBlockStatus,
      props.onOpenChange,
      async (updatedAt) => {
        if (!updatedAt || props.selectedLeagueId === null) return;
        const structureSaved = await updateLeagueStructure(
          props.selectedLeagueId,
          {
            season_name: String(values.season_name).trim(),
            league_format: String(values.league_format)
              .toLowerCase()
              .replace(' ', '_'),
            number_of_weeks: calculatedWeeks!,
            number_of_teams: Number(values.number_of_teams),
            number_of_blocks: blocks,
          },
        );
        if (!structureSaved)
          throw new Error('Unable to save league structure.');
        props.setListOfLeaguesByUser((current) =>
          current.map((league) =>
            league.id === props.selectedLeagueId
              ? {
                  ...league,
                  updated_at: updatedAt,
                  setup_completed: true,
                  is_active: true,
                  season_name: values.season_name,
                  league_format: values.league_format,
                  number_of_weeks: calculatedWeeks!,
                  number_of_teams: values.number_of_teams,
                  number_of_blocks: blocks,
                  games_per_week: games,
                  players_per_game: players,
                  starting_lane: lane,
                  total_lanes: lanes,
                }
              : league,
          ),
        );
      },
    );
  };

  const renderField = (field: BlockSetupDialogField) => {
    const isCalculatedWeekField =
      field.key === 'number_of_weeks' || field.key === 'schedule_weeks';
    const isCalculatedEndDate = field.key === 'end_date';
    const isCalculatedField = isCalculatedWeekField || isCalculatedEndDate;
    const totalLanesValue = Number(values.total_lanes);
    const hasValidTotalLanes =
      Number.isSafeInteger(totalLanesValue) && totalLanesValue > 0;
    const isStartingLaneLocked =
      field.key === 'starting_lane' && !hasValidTotalLanes;
    const isConditionallyLocked =
      (field.key === 'open_average_threshold' &&
        !Boolean(values.allow_open_bowlers)) ||
      (field.key === 'new_player_handicap' &&
        !Boolean(values.addition_round)) ||
      (field.key === 'peterson_points' && !Boolean(values.enable_peterson)) ||
      (handicapSettingFields.includes(field.key) &&
        !Boolean(values.enable_handicap)) ||
      (perfectGamePrizeFields.includes(field.key) &&
        !Boolean(values.award_perfect_game)) ||
      (weeklyPrizeFields.includes(field.key) &&
        !Boolean(values.award_weekly)) ||
      (finalPrizeFields.includes(field.key) && !Boolean(values.award_final)) ||
      (Boolean(finalHandicapAwardDependency[field.key]) &&
        (!Boolean(values.award_final) ||
          !Boolean(values[finalHandicapAwardDependency[field.key]]))) ||
      (bakerEventFields.includes(field.key) && !Boolean(values.team_bakers)) ||
      (jackpotEventFields.includes(field.key) && !Boolean(values.jackpot)) ||
      (field.key === 'jackpot_carry_forward_amount' &&
        !Boolean(values.jackpot_carry_forward)) ||
      (scotchEventFields.includes(field.key) &&
        !Boolean(values.scotch_doubles));
    const isDisabledField =
      isCalculatedField ||
      isStartingLaneLocked ||
      isConditionallyLocked ||
      savingStep;
    const conditionalLockHint =
      field.key === 'open_average_threshold' && isConditionallyLocked
        ? 'Enable Allow Open Bowlers to edit this field.'
        : field.key === 'new_player_handicap' && isConditionallyLocked
          ? 'Enable Addition Allowed in 2nd Round to edit this field.'
          : field.key === 'peterson_points' && isConditionallyLocked
            ? 'Enable Peterson Points to edit this field.'
            : perfectGamePrizeFields.includes(field.key) &&
                isConditionallyLocked
              ? 'Enable Perfect Game to edit this field.'
              : weeklyPrizeFields.includes(field.key) && isConditionallyLocked
                ? 'Enable Weekly Awards to edit this field.'
                : (finalPrizeFields.includes(field.key) ||
                      Boolean(finalHandicapAwardDependency[field.key])) &&
                    isConditionallyLocked
                  ? 'Enable the matching Final Award to edit this field.'
                  : bakerEventFields.includes(field.key) &&
                      isConditionallyLocked
                    ? 'Enable Team Bakers to edit this field.'
                    : jackpotEventFields.includes(field.key) &&
                        isConditionallyLocked
                      ? 'Enable Jackpot to edit this field.'
                      : scotchEventFields.includes(field.key) &&
                          isConditionallyLocked
                        ? 'Enable Scotch Doubles to edit this field.'
                        : handicapSettingFields.includes(field.key) &&
                            isConditionallyLocked
                          ? 'Enable Handicap to edit this field.'
                          : undefined;
    const value = isCalculatedWeekField
      ? (calculatedWeeks?.toString() ?? '')
      : isCalculatedEndDate
        ? (calculatedEndDate ?? '')
        : (values[field.key] ?? '');
    const fieldError = isConditionallyLocked ? null : getFieldError(field);
    const errorId = `field-error-${field.key}`;
    const label = (
      <div className="flex min-w-0 items-center gap-1.5">
        <Label
          htmlFor={field.key}
          className="min-w-0 text-[11px] font-medium text-slate-300"
        >
          {field.label}
          {field.required && <span className="ml-1 text-fuchsia-400">*</span>}
        </Label>
        <FieldHelp field={field} />
      </div>
    );
    if (field.type === 'toggle' || field.type === 'check') {
      const checked = Boolean(value);
      return (
        <div
          key={field.key}
          className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left text-xs text-slate-300"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span>{field.label}</span>
            <FieldHelp field={field} />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={field.label}
            disabled={savingStep || isConditionallyLocked}
            onClick={() => update(field.key, !checked)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-fuchsia-600' : 'bg-slate-700'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-[18px]' : 'left-0.5'}`}
            />
          </button>
        </div>
      );
    }
    const baseClass =
      'mt-1 h-8 w-full min-w-0 max-w-full rounded-md border border-white/10 bg-[#0c0a16] px-2 text-xs text-slate-100 outline-none focus:border-fuchsia-500 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60';
    return (
      <div key={field.key} className="min-w-0 space-y-1">
        {label}
        {field.type === 'select' ? (
          <select
            id={field.key}
            className={baseClass}
            disabled={savingStep || isConditionallyLocked}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? errorId : undefined}
            value={String(value)}
            onChange={(event) => update(field.key, event.target.value)}
          >
            {field.key === 'league_day' && (
              <option value="">Select league day</option>
            )}
            {field.key === 'calculation_method' && (
              <option value="">Select calculation method</option>
            )}
            {field.key === 'tie_handling' && (
              <option value="">Select tie handling</option>
            )}
            {field.key === 'baker_tie_handling' && (
              <option value="">Select Baker tie breaker</option>
            )}
            {field.key === 'baker_winning_basis' && (
              <option value="">Select winning basis</option>
            )}
            {field.key === 'walkover_rule' && (
              <option value="">Select walkover rule</option>
            )}
            {field.key === 'forfeit_rule' && (
              <option value="">Select forfeit rule</option>
            )}
            {field.key === 'postponement_notice_day' && (
              <option value="">Select notice day</option>
            )}
            {field.key === 'postponement_notice_channel' && (
              <option value="">Select notice channel</option>
            )}
            {field.key === 'post_bowl_cutoff_day' && (
              <option value="">Select cutoff day</option>
            )}
            {(field.options ?? []).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : (
          <Input
            id={field.key}
            className={baseClass}
            type={field.type ?? 'text'}
            min={field.type === 'number' ? 0 : undefined}
            value={String(value)}
            placeholder={field.placeholder}
            disabled={isDisabledField}
            tabIndex={isDisabledField ? -1 : undefined}
            readOnly={isCalculatedField}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? errorId : undefined}
            onChange={(event) => {
              if (
                isCalculatedField ||
                isStartingLaneLocked ||
                isConditionallyLocked
              )
                return;
              const nextValue = event.target.value;
              if (field.type !== 'number' || nextValue === '') {
                update(field.key, nextValue);
              } else if (Number(nextValue) >= 0) {
                update(field.key, nextValue);
              } else {
                setTouchedFields((current) => ({
                  ...current,
                  [field.key]: true,
                }));
                setRejectedInputErrors((current) => ({
                  ...current,
                  [field.key]: 'Negative values are not allowed.',
                }));
              }
            }}
          />
        )}
        {fieldError && (
          <p
            id={errorId}
            role="alert"
            className="text-[10px] font-medium text-red-400"
          >
            {fieldError}
          </p>
        )}
        {(field.key === 'number_of_teams' ||
          field.hint ||
          isStartingLaneLocked ||
          conditionalLockHint) && (
          <p className="text-[10px] text-slate-500">
            {field.key === 'number_of_teams'
              ? Number(values.number_of_teams) % 2 === 1
                ? 'Odd team count: one Blind team will be included in the schedule.'
                : field.hint
              : isStartingLaneLocked
                ? 'Enter Total Lanes first to enable Starting Lane.'
                : (conditionalLockHint ?? field.hint)}
          </p>
        )}
      </div>
    );
  };

  const renderGroups = (sectionIndex: number) => {
    const currentGroups = leagueSetupGroups[sectionIndex] ?? [];
    const groupGridClass =
      sectionIndex === 0 ? 'grid-cols-1' : 'grid-cols-1 2xl:grid-cols-2';
    return (
      <div className={`grid w-full min-w-0 gap-3 ${groupGridClass}`}>
        {currentGroups.map((group) => {
          const fields =
            sectionIndex === 0
              ? leagueSetupFields.filter((field) =>
                  group.fields.some((item) => item.key === field.key),
                )
              : group.fields;
          return (
            <section
              key={group.title}
              className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-3"
            >
              <h3 className="mb-3 text-xs font-semibold text-white">
                {group.title}
              </h3>
              <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                {fields.map(renderField)}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  const Icon = leagueSetupSections[step].icon;
  const isReview = step === 8;
  const reviewRows = leagueSetupFields.map((field) => [
    field.label,
    field.key === 'number_of_weeks'
      ? String(calculatedWeeks ?? '—')
      : String(values[field.key] ?? '—'),
  ]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open && (props.creatingBlocks || savingStep)) return;
        props.onOpenChange(open);
      }}
    >
      <DialogContent
        onPointerDownOutside={(event) => event.preventDefault()}
        className="rounded-2xl border border-fuchsia-500/20 bg-[#100d1b] text-white shadow-[0_28px_100px_rgba(0,0,0,.7)] [&>button]:hidden"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: 'min(1180px, calc(100vw - 2rem))',
          height: 'min(850px, calc(100dvh - 2rem))',
          maxWidth: 'none',
          maxHeight: 'none',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 bg-[#151121] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-600/20 text-fuchsia-300">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold">
                League Setup – {props.selectedLeagueName || 'New League'}
              </h2>
              <p className="truncate text-[11px] text-slate-400">
                Configure the settings for this league. Complete all required
                sections to access the league dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close setup"
            disabled={props.creatingBlocks || savingStep}
            onClick={() => props.onOpenChange(false)}
            className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[210px] shrink-0 flex-col border-r border-white/10 bg-[#0c0a14] p-3 md:flex">
            <nav className="space-y-1">
              {leagueSetupSections.map((item, index) => {
                const StepIcon = item.icon;
                const active = step === index;
                const complete = completion[index];
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => void saveStepAndGo(index, true)}
                    disabled={
                      savingStep ||
                      props.creatingBlocks ||
                      !canOpenStepFromSidebar(index)
                    }
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] transition ${active ? 'bg-fuchsia-700/50 text-white ring-1 ring-fuchsia-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${active ? 'border-fuchsia-300 bg-fuchsia-500 text-white' : complete ? 'border-emerald-500 text-emerald-400' : 'border-slate-600'}`}
                    >
                      {complete ? (
                        <CircleCheck className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <StepIcon className="h-3.5 w-3.5" />
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold">Setup Progress</span>
                <span className="text-fuchsia-300">{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="League setup progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-2 w-full overflow-hidden rounded-full border border-white/10 bg-[#342b45]"
                style={{ height: 10 }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${progress}%`,
                    minWidth: progress > 0 ? 5 : 0,
                    background:
                      'linear-gradient(90deg, #e879f9 0%, #a855f7 100%)',
                    boxShadow: '0 0 8px rgba(217, 70, 239, 0.75)',
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                {completedCount} of 9 sections completed
              </p>
            </div>
          </aside>
          <main
            ref={mainRef}
            className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-fuchsia-500/15 p-2.5 text-fuchsia-300">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">
                  {step + 1}.{' '}
                  {leagueSetupSections[step].title === 'Structure'
                    ? 'League Structure'
                    : leagueSetupSections[step].title}
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  {leagueSetupSections[step].description}
                </p>
              </div>
            </div>
            {isReview ? (
              <div className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
                  <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <ClipboardList className="h-4 w-4 text-fuchsia-300" />
                      Setup Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {reviewRows.map(([label, value]) => (
                        <React.Fragment key={label}>
                          <span className="text-slate-400">{label}</span>
                          <span className="truncate text-slate-100">
                            {value || '—'}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Section Checklist
                    </h3>
                    <div className="space-y-2">
                      {leagueSetupSections.slice(0, 8).map((section, index) => (
                        <div
                          key={section.title}
                          className="flex items-center gap-2 text-xs"
                        >
                          <CircleCheck
                            className={`h-4 w-4 ${completion[index] ? 'text-emerald-400' : 'text-amber-400'}`}
                          />
                          <span>{section.title}</span>
                          <span className="ml-auto text-slate-500">
                            {completion[index] ? 'Complete' : 'Review'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <div
                  className={`rounded-xl border p-3 text-xs ${completedCount >= 8 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <BadgeCheck className="h-4 w-4" />
                    {completedCount >= 8
                      ? 'All required sections are complete.'
                      : 'Review the incomplete sections before activation.'}
                  </div>
                  <p className="mt-1 pl-6 text-[11px] opacity-80">
                    You can now activate this league and access the dashboard.
                  </p>
                </div>
              </div>
            ) : (
              renderGroups(step)
            )}
            {step === 0 && !sectionCompletion[0] && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Fill in every Structure field with a positive whole number where
                required. Blocks must be 1–10, and the starting lane cannot be
                greater than the total lanes.
              </p>
            )}
            {saveError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
              >
                {saveError}
              </p>
            )}
            {previewMode && previewHasChanges && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Preview changes are not saved yet. Click Next on this step to
                save your changes.
              </p>
            )}
          </main>
        </div>
        <footer className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#151121] px-3 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 md:hidden">
            Step {step + 1} of 9
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (step === 0) {
                  props.onOpenChange(false);
                } else {
                  setStep(step - 1);
                  setPreviewMode(true);
                }
              }}
              disabled={props.creatingBlocks || savingStep}
              className="h-9 gap-1 text-xs text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < 8 ? (
              <Button
                type="button"
                disabled={
                  props.creatingBlocks || savingStep || !sectionCompletion[step]
                }
                onClick={() => void saveStepAndGo(step + 1)}
                className="h-9 gap-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 text-xs text-white hover:from-purple-500 hover:to-fuchsia-500"
              >
                {savingStep ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Step {step + 1}...
                  </>
                ) : (
                  <>
                    Next: {leagueSetupSections[step + 1].title}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={save}
                disabled={props.creatingBlocks}
                className="h-9 gap-1 bg-gradient-to-r from-emerald-600 to-green-500 px-4 text-xs text-white hover:from-emerald-500 hover:to-green-400"
              >
                {props.creatingBlocks ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                {props.creatingBlocks ? 'Activating…' : 'Activate League'}
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
