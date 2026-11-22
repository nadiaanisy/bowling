import type {
  BlockSetupDialogField,
  BlockSetupDialogFormValues,
  BlockSetupDialogGroup,
} from '../type';
import {
  CalendarDays,
  Gift,
  Layers,
  Medal,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

export const leagueSetupFieldHelp: Record<string, string> = {
  season_name:
    'A label for this league season, such as 2026/27. It appears in league details and reports.',
  league_format:
    'Choose how teams or bowlers compete and earn points during each match.',
  number_of_weeks:
    'Calculated from rounds and teams. If the entered team count is odd, one Blind team is included for scheduling.',
  number_of_teams: 'The number of teams taking part in the league.',
  number_of_blocks:
    'The number of rounds in the league. This also sets the number of blocks, so enter the value once here.',
  games_per_week: 'How many games each team bowls during one weekly session.',
  players_per_game: 'How many bowlers from each team can bowl in a game.',
  total_lanes: 'The total number of lanes available for this league.',
  starting_lane: 'The first lane number used when assigning teams to lanes.',
  league_day: 'The usual day of the week when league sessions are held.',
  commencement_date: 'The date of the first scheduled league session.',
  end_date:
    'Calculated from the commencement date and the total number of weekly sessions.',
  schedule_weeks:
    'Matches No. of Weeks in Structure and is calculated from rounds and the full team count.',
  practice_time: 'When bowlers may begin their warm-up practice.',
  game_start_time: 'The scheduled time for the first game to begin.',
  late_cutoff:
    'The latest arrival time allowed before the late-arrival rule applies.',
  allow_pre_bowl:
    'Allow a team to bowl its match before the scheduled league day.',
  allow_post_bowl:
    'Allow a team to bowl its match after the scheduled league day.',
  block_post_bowl_final:
    'Prevent post-bowling during the final week of the season.',
  max_roster_size: 'The largest number of bowlers allowed on one team roster.',
  graded_bowlers_min:
    'The minimum number of graded bowlers required on a team.',
  open_bowlers_max: 'The maximum number of open bowlers allowed on a team.',
  open_bowlers_per_week:
    'The maximum number of open bowlers from one team who may bowl in a week.',
  allow_open_bowlers:
    'Allow bowlers without an established league average to join.',
  open_average_threshold:
    'The average at or above which a bowler is treated as open.',
  minimum_players_start:
    'The minimum number of eligible players needed for a team to start.',
  minimum_games_qualify:
    'The games a bowler must complete to qualify for standings or awards.',
  minimum_series_by_deadline:
    'The minimum number of series each registered bowler must complete by the eligibility deadline.',
  eligibility_deadline_week:
    'The week by which each registered bowler must complete the required series.',
  allow_national_elite:
    'The league rules prohibit National Elite bowlers from taking part.',
  allow_substitutes:
    'The league rules do not permit substitute players during a game series.',
  addition_round: 'Allow a new player to be added during the second round.',
  new_player_handicap:
    'The handicap assigned to a new player until an average is established.',
  team_win_points: 'Points awarded to a team for winning the match.',
  team_loss_points: 'Points awarded to a team for losing the match.',
  team_tie_points: 'Points awarded to each team when the match is tied.',
  team_above_average:
    'Award the additional point when a team scores above its team average.',
  game_win_points: 'Points awarded for winning an individual game.',
  series_win_points: 'Points awarded for winning the combined series.',
  team_high_series: 'Award extra points to the team with the highest series.',
  individual_high_game:
    'Award extra points to the bowler with the highest single game.',
  individual_high_series:
    'Award extra points to the bowler with the highest series.',
  enable_peterson:
    'Use Peterson points, a bonus-point format based on team performance.',
  peterson_points: 'The Peterson points a team earns for each 200 pins scored.',
  enable_handicap:
    'Apply handicap pins to scores when calculating league results.',
  calculation_method:
    'Choose the formula used to calculate each bowler’s handicap.',
  base_average:
    'The reference average used as the starting point for the handicap formula.',
  handicap_percentage:
    'The percentage of the difference from the base average given as handicap.',
  games_for_average:
    'Games a bowler must complete before using a league average.',
  men_maximum: 'The highest handicap allowed for male bowlers.',
  ladies_maximum: 'The highest handicap allowed for female bowlers.',
  round_handicap: 'Round calculated handicap pins to the nearest whole number.',
  promote_handicap:
    'Set handicap to zero when a promoted bowler reaches the chosen level.',
  award_perfect_game: 'Offer an award for bowling a perfect 300 game.',
  award_double_perfect: 'Offer an award for bowling two perfect games.',
  perfect_game_round1_prize: 'Prize for a perfect game in Round 1.',
  perfect_game_round2_prize: 'Prize for a perfect game in Round 2.',
  perfect_game_share_winners:
    'Split the round prize equally when multiple bowlers achieve a perfect game.',
  perfect_game_carry_forward:
    'Carry an unclaimed perfect-game prize into the next round or season.',
  award_high_game:
    'Offer an award for the highest scratch game by an individual.',
  award_high_series:
    'Offer an award for the highest scratch series by an individual.',
  award_high_handicap:
    'Offer an award for the individual highest game including handicap pins.',
  award_individual_high_series_handicap:
    'Offer an award for the individual highest series including handicap pins.',
  award_team_high_game_handicap:
    'Offer an award for the team highest game including handicap pins.',
  award_team_series: 'Offer an award for the highest team series.',
  weekly_individual_high_game_hcp_games:
    'Free games awarded for the individual high-game handicap weekly award.',
  weekly_individual_high_series_hcp_games:
    'Free games awarded for the individual high-series handicap weekly award.',
  weekly_team_high_game_hcp_games:
    'Free games awarded for the team high-game handicap weekly award.',
  weekly_team_high_series_hcp_games:
    'Free games awarded for the team high-series handicap weekly award.',
  final_champion_prize: 'Final league prize for the Champion team.',
  final_second_place_prize: 'Final league prize for the 2nd position team.',
  final_third_place_prize: 'Final league prize for the 3rd position team.',
  final_fourth_place_prize: 'Final league prize for the 4th position team.',
  final_fifth_place_prize: 'Final league prize for the 5th position team.',
  final_sixth_place_prize: 'Final league prize for the 6th position team.',
  final_seventh_place_prize: 'Final league prize for the 7th position team.',
  final_eighth_place_prize: 'Final league prize for the 8th position team.',
  final_ninth_place_prize: 'Final league prize for the 9th position team.',
  final_10_to_20_prize: 'Final league prize for teams placed 10th to 20th.',
  final_21_to_31_prize: 'Final league prize for teams placed 21st to 31st.',
  final_team_high_series_hcp_prize: 'Prize for team high series handicap.',
  final_team_high_game_hcp_prize: 'Prize for team high game handicap.',
  final_individual_high_series_hcp_prize:
    'Prize for individual high series handicap.',
  final_individual_high_game_hcp_prize:
    'Prize for individual high game handicap.',
  award_weekly: 'Give awards for results achieved during each league week.',
  award_final: 'Give awards for season-ending or championship results.',
  award_minimum_games: 'Games a bowler must complete to qualify for awards.',
  prize_list_deadline_weeks:
    'Number of weeks after commencement by which the prize list must be posted.',
  high_series_priority:
    'Give the high-series prize when a participant qualifies for both high series and high-game handicap prizes.',
  multiple_awards:
    'Allow one bowler to win more than one award in the same category.',
  tie_handling: 'Choose how prizes are handled when bowlers or teams tie.',
  scotch_doubles:
    'Enable the Scotch Doubles event, where partners alternate shots.',
  scotch_max_pairs: 'The most pairs a team may enter in Scotch Doubles.',
  scotch_games: 'The number of games each Scotch Doubles pair bowls.',
  scotch_entry_fee: 'The entry fee charged for each Scotch Doubles pair.',
  scotch_qualification:
    'The minimum league games needed to enter Scotch Doubles.',
  team_bakers:
    'Enable Baker-format team games, with bowlers taking turns each frame.',
  baker_bowlers:
    'The number of bowlers who take turns in each Baker game. The document divides the total handicap of these bowlers by this number for each game.',
  baker_games: 'The number of Baker-format games in the event.',
  baker_start_time: 'The start time for the Baker event.',
  baker_entry_fee: 'The entry fee charged to each team for the Baker event.',
  baker_winning_basis:
    'The Baker event winner is decided by highest total pinfall.',
  baker_change_bowler_each_game:
    'Allow a team to change its bowler after each Baker game.',
  baker_keep_remaining_order:
    'Keep the other bowlers in their original order when a bowler is changed.',
  baker_tie_handling: 'The document breaks a tie using the final Baker game.',
  baker_champion_prize: 'Baker event prize for the Champion team.',
  baker_second_place_prize: 'Baker event prize for 2nd position.',
  baker_third_place_prize: 'Baker event prize for 3rd position.',
  baker_fourth_place_prize: 'Baker event prize for 4th position.',
  baker_fifth_place_prize: 'Baker event prize for 5th position.',
  baker_sixth_place_prize: 'Baker event prize for 6th position.',
  baker_7_to_10_prize: 'Baker event prize for teams placed 7th to 10th.',
  baker_11_to_31_prize: 'Baker event prize for teams placed 11th to 31st.',
  jackpot: 'Enable a weekly jackpot contribution and prize pool.',
  jackpot_contribution:
    'The amount each team contributes to the jackpot each week.',
  jackpot_carry_forward: 'Add an unclaimed jackpot to the next prize pool.',
  jackpot_carry_forward_amount:
    'The previous season jackpot amount carried into this league.',
  walkover_deduction: 'Pins deducted when a team receives a walkover result.',
  walkover_rule:
    'Choose how the score or points are calculated for a walkover.',
  walkover_target_required:
    'The opposing team must reach its team aggregate average minus the walkover deduction to receive winning points.',
  walkover_unmet_target_peterson_counts:
    'If the opponent misses the target, award no winning points but count pinfall toward Peterson Points.',
  walkover_team_peterson_only:
    'A team that walks over receives Peterson Points only.',
  forfeit_rule: 'Choose the result recorded when a team forfeits a match.',
  blind_fees_forfeited:
    'Game fees for blind scores are forfeited under the league rules.',
  blind_score: 'The scratch score used for a blind or absent player.',
  no_joining_after_frame:
    'Do not allow a late bowler to join after the specified frame.',
  review_handicap: 'Review or reset a bowler’s handicap after promotion.',
  public_holiday: 'Skip league sessions that fall on a public holiday.',
  postponement_limit:
    'The maximum number of postponed sessions allowed per team.',
  junior_postponement_limit:
    'Special postponement limit for Megalanes Junior teams.',
  postponement_notice_day:
    'The weekday by which postponement notice must be sent.',
  postponement_notice_time:
    'The latest time to notify the center supervisor and opponent.',
  postponement_notice_channel:
    'The communication channel required for postponement notices.',
  postponement_notice_parties:
    'People who must be informed about a postponement.',
  post_bowl_cutoff_day:
    'The weekly cutoff day for post-bowling before the next league game.',
  no_post_bowl_walkover_week:
    'The week when post-bowling and walkovers are prohibited.',
  no_postponements_week: 'The week when postponements are prohibited.',
  allow_pre_bowl_restricted_week:
    'Allow teams to arrange a pre-bowl during the week that bans post-bowling and walkovers.',
  fasting_month_rule:
    'During Ramadan, Muslim bowlers’ pre/post bowls do not count; arrange for both teams to bowl together on another date.',
  dong_code: 'An optional administrator-only code used for league operations.',
};

export const leagueSetupSections = [
  {
    title: 'Structure',
    icon: Layers,
    description: 'Basic competition details for this league season.',
  },
  {
    title: 'Schedule & Timing',
    icon: CalendarDays,
    description:
      'Set the league schedule, bowling times, and related timing rules.',
  },
  {
    title: 'Roster & Eligibility',
    icon: Users,
    description: 'Define team roster limits and player eligibility rules.',
  },
  {
    title: 'Scoring & Points',
    icon: Trophy,
    description:
      'Set how points are awarded for games, series, and team results.',
  },
  {
    title: 'Handicap',
    icon: Medal,
    description: 'Configure handicap calculation and limits for bowlers.',
  },
  {
    title: 'Awards & Prizes',
    icon: Gift,
    description:
      'Set the awards, qualifications, and prize details for the league.',
  },
  {
    title: 'Special Events',
    icon: Sparkles,
    description:
      'Configure additional events such as Scotch Doubles, Team Bakers, and Jackpot.',
  },
  {
    title: 'Rules & Operations',
    icon: Settings2,
    description:
      'Set operational rules such as walkover, forfeiture, and other league policies.',
  },
  {
    title: 'Review & Activate',
    icon: ShieldCheck,
    description: 'Review your league setup before activating the league.',
  },
];

export const leagueSetupGroups: BlockSetupDialogGroup[][] = [
  [
    {
      title: 'League Information',
      fields: [
        {
          key: 'season_name',
          label: 'Season Name / Label',
          placeholder: 'e.g. 2026/27',
          required: true,
        },
        {
          key: 'league_format',
          label: 'League Format',
          type: 'select',
          options: ['Head to Head', 'Baker', 'Individual'],
        },
      ],
    },
    {
      title: 'Competition Setup',
      fields: [
        {
          key: 'number_of_weeks',
          label: 'No. of Weeks',
          type: 'number',
          required: true,
        },
        {
          key: 'number_of_teams',
          label: 'No. of Teams',
          type: 'number',
          required: true,
        },
        {
          key: 'number_of_blocks',
          label: 'No. of Rounds',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      title: 'Match / Bowling Setup',
      fields: [
        {
          key: 'games_per_week',
          label: 'Games per Week',
          type: 'number',
          required: true,
        },
        {
          key: 'players_per_game',
          label: 'Players per Game',
          type: 'number',
          required: true,
        },
        {
          key: 'total_lanes',
          label: 'Total Lanes',
          type: 'number',
          required: true,
        },
        {
          key: 'starting_lane',
          label: 'Starting Lane',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
  [
    {
      title: 'League Schedule',
      fields: [
        {
          key: 'league_day',
          label: 'League Day',
          type: 'select',
          options: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          required: true,
        },
        {
          key: 'commencement_date',
          label: 'Commencement Date',
          type: 'date',
          required: true,
        },
        {
          key: 'end_date',
          label: 'End Date',
          type: 'date',
          required: true,
          hint: 'Calculated from the commencement date and No. of Weeks.',
        },
        {
          key: 'schedule_weeks',
          label: 'No. of Weeks',
          type: 'number',
          required: true,
          hint: 'Calculated automatically from rounds and teams, including a Blind team when needed.',
        },
      ],
    },
    {
      title: 'Bowling Time',
      fields: [
        {
          key: 'practice_time',
          label: 'Practice Time',
          type: 'time',
          required: true,
        },
        {
          key: 'game_start_time',
          label: 'Game Start Time',
          type: 'time',
          required: true,
        },
        {
          key: 'late_cutoff',
          label: 'Late Arrival Cutoff',
          type: 'time',
          required: true,
        },
      ],
    },
    {
      title: 'Schedule Options',
      fields: [
        { key: 'allow_pre_bowl', label: 'Allow Pre-bowl', type: 'toggle' },
        { key: 'allow_post_bowl', label: 'Allow Post-bowl', type: 'toggle' },
        {
          key: 'block_post_bowl_final',
          label: 'Block Post-bowl in Final Week',
          type: 'toggle',
        },
      ],
    },
  ],
  [
    {
      title: 'Team Roster',
      fields: [
        {
          key: 'max_roster_size',
          label: 'Maximum Roster Size',
          type: 'number',
          required: true,
        },
        {
          key: 'graded_bowlers_min',
          label: 'Graded Bowlers (min)',
          type: 'number',
        },
        {
          key: 'open_bowlers_max',
          label: 'Open Bowlers (max)',
          type: 'number',
        },
        {
          key: 'open_bowlers_per_week',
          label: 'Open Bowlers Allowed per Week',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      title: 'Open Bowler Rule',
      fields: [
        {
          key: 'allow_open_bowlers',
          label: 'Allow Open Bowlers',
          type: 'toggle',
        },
        {
          key: 'open_average_threshold',
          label: 'Open Average Threshold',
          type: 'number',
        },
      ],
    },
    {
      title: 'Player Eligibility',
      fields: [
        {
          key: 'minimum_players_start',
          label: 'Minimum Players to Start',
          type: 'number',
          required: true,
        },
        {
          key: 'minimum_games_qualify',
          label: 'Minimum Games to Qualify',
          type: 'number',
          required: true,
        },
        {
          key: 'minimum_series_by_deadline',
          label: 'Minimum Series by Deadline',
          type: 'number',
          required: true,
        },
        {
          key: 'eligibility_deadline_week',
          label: 'Eligibility Deadline Week',
          type: 'number',
          required: true,
        },
        {
          key: 'allow_national_elite',
          label: 'Allow National Elite Bowlers',
          type: 'toggle',
        },
        {
          key: 'allow_substitutes',
          label: 'Allow Substitute Players',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'New Player Rule',
      fields: [
        {
          key: 'addition_round',
          label: 'Addition Allowed in 2nd Round',
          type: 'toggle',
        },
        {
          key: 'new_player_handicap',
          label: 'Handicap for New Player',
          type: 'number',
        },
      ],
    },
  ],
  [
    {
      title: 'Team Points (Head to Head)',
      fields: [
        {
          key: 'team_win_points',
          label: 'Team Win Points',
          type: 'number',
          required: true,
        },
        { key: 'team_loss_points', label: 'Team Loss Points', type: 'number' },
        { key: 'team_tie_points', label: 'Team Tie Points', type: 'number' },
      ],
    },
    {
      title: 'Individual Points (per match)',
      fields: [
        {
          key: 'game_win_points',
          label: 'Game Win Points',
          type: 'number',
          required: true,
        },
        {
          key: 'series_win_points',
          label: 'Series Win Points',
          type: 'number',
        },
      ],
    },
    {
      title: 'Additional Points',
      fields: [
        { key: 'team_high_series', label: 'Team High Series', type: 'check' },
        {
          key: 'team_above_average',
          label: 'Team Above Team Average',
          type: 'check',
        },
        {
          key: 'individual_high_game',
          label: 'Individual High Game',
          type: 'check',
        },
        {
          key: 'individual_high_series',
          label: 'Individual High Series',
          type: 'check',
        },
      ],
    },
    {
      title: 'Peterson Points',
      fields: [
        {
          key: 'enable_peterson',
          label: 'Enable Peterson Points',
          type: 'toggle',
        },
        {
          key: 'peterson_points',
          label: 'Points per 200 Pins',
          type: 'number',
        },
      ],
    },
  ],
  [
    {
      title: 'Handicap Settings',
      fields: [
        { key: 'enable_handicap', label: 'Enable Handicap', type: 'toggle' },
        {
          key: 'calculation_method',
          label: 'Calculation Method',
          type: 'select',
          options: [
            '(Base - Average) × Percentage',
            'Fixed handicap',
            'No handicap',
          ],
          required: true,
        },
        {
          key: 'base_average',
          label: 'Base Average',
          type: 'number',
          required: true,
        },
        { key: 'handicap_percentage', label: 'Percentage', type: 'number' },
        {
          key: 'games_for_average',
          label: 'Games for Establishing Average',
          type: 'number',
        },
      ],
    },
    {
      title: 'Maximum Handicap',
      fields: [
        { key: 'men_maximum', label: 'Men Maximum', type: 'number' },
        { key: 'ladies_maximum', label: 'Ladies Maximum', type: 'number' },
        {
          key: 'round_handicap',
          label: 'Round handicap to nearest whole pin',
          type: 'check',
        },
        {
          key: 'promote_handicap',
          label: 'Set handicap to 0 for promoted bowlers',
          type: 'check',
        },
      ],
    },
  ],
  [
    {
      title: 'Perfect Game Awards',
      fields: [
        { key: 'award_perfect_game', label: 'Perfect Game', type: 'check' },
        {
          key: 'perfect_game_round1_prize',
          label: 'Round 1 Prize',
          placeholder: 'RM 0.00',
        },
        {
          key: 'perfect_game_round2_prize',
          label: 'Round 2 Prize',
          placeholder: 'RM 0.00',
        },
        {
          key: 'perfect_game_share_winners',
          label: 'Share if Multiple Bowlers',
          type: 'check',
        },
        {
          key: 'perfect_game_carry_forward',
          label: 'Carry Forward Unclaimed Prize',
          type: 'check',
        },
      ],
    },
    {
      title: 'Award Types',
      fields: [
        {
          key: 'award_double_perfect',
          label: 'Double Perfect Game',
          type: 'check',
        },
        {
          key: 'award_high_game',
          label: 'High Game (Individual)',
          type: 'check',
        },
        {
          key: 'award_high_series',
          label: 'High Series (Individual)',
          type: 'check',
        },
        {
          key: 'award_high_handicap',
          label: 'Individual High Game (Handicap)',
          type: 'check',
        },
        {
          key: 'award_individual_high_series_handicap',
          label: 'Individual High Series (Handicap)',
          type: 'check',
        },
        {
          key: 'award_team_high_game_handicap',
          label: 'Team High Game (Handicap)',
          type: 'check',
        },
        {
          key: 'award_team_series',
          label: 'Team High Series (Handicap)',
          type: 'check',
        },
        { key: 'award_weekly', label: 'Weekly Awards', type: 'check' },
        { key: 'award_final', label: 'Final Annual Awards', type: 'check' },
      ],
    },
    {
      title: 'Weekly Award Prizes',
      fields: [
        {
          key: 'weekly_individual_high_game_hcp_games',
          label: 'Individual High Game Hcp (Free Games)',
          type: 'number',
        },
        {
          key: 'weekly_individual_high_series_hcp_games',
          label: 'Individual High Series Hcp (Free Games)',
          type: 'number',
        },
        {
          key: 'weekly_team_high_game_hcp_games',
          label: 'Team High Game Hcp (Free Games)',
          type: 'number',
        },
        {
          key: 'weekly_team_high_series_hcp_games',
          label: 'Team High Series Hcp (Free Games)',
          type: 'number',
        },
      ],
    },
    {
      title: 'Final Team Prize Money',
      fields: [
        {
          key: 'final_champion_prize',
          label: 'Champion',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_second_place_prize',
          label: '2nd Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_third_place_prize',
          label: '3rd Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_fourth_place_prize',
          label: '4th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_fifth_place_prize',
          label: '5th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_sixth_place_prize',
          label: '6th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_seventh_place_prize',
          label: '7th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_eighth_place_prize',
          label: '8th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_ninth_place_prize',
          label: '9th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_10_to_20_prize',
          label: '10th–20th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_21_to_31_prize',
          label: '21st–31st Position',
          placeholder: 'RM 0.00',
        },
      ],
    },
    {
      title: 'Final Handicap Award Prizes',
      fields: [
        {
          key: 'final_team_high_series_hcp_prize',
          label: 'Team High Series Hcp',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_team_high_game_hcp_prize',
          label: 'Team High Game Hcp',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_individual_high_series_hcp_prize',
          label: 'Individual High Series Hcp',
          placeholder: 'RM 0.00',
        },
        {
          key: 'final_individual_high_game_hcp_prize',
          label: 'Individual High Game Hcp',
          placeholder: 'RM 0.00',
        },
      ],
    },
    {
      title: 'Qualification & Rules',
      fields: [
        {
          key: 'award_minimum_games',
          label: 'Minimum Games to Qualify',
          type: 'number',
          required: true,
        },
        {
          key: 'prize_list_deadline_weeks',
          label: 'Prize List Posted Within (Weeks)',
          type: 'number',
        },
        {
          key: 'multiple_awards',
          label: 'Allow Multiple Awards per Bowler',
          type: 'toggle',
        },
        {
          key: 'high_series_priority',
          label: 'High Series Prize Takes Priority',
          type: 'check',
        },
        {
          key: 'tie_handling',
          label: 'Tie Handling',
          type: 'select',
          options: ['Share Prize', 'Countback', 'League decides'],
        },
      ],
    },
  ],
  [
    {
      title: 'Scotch Doubles',
      fields: [
        {
          key: 'scotch_doubles',
          label: 'Enable Scotch Doubles',
          type: 'check',
        },
        {
          key: 'scotch_max_pairs',
          label: 'Max Pairs per Team',
          type: 'number',
        },
        { key: 'scotch_games', label: 'Games per Pair', type: 'number' },
        { key: 'scotch_entry_fee', label: 'Entry Fee', placeholder: 'RM 0.00' },
        {
          key: 'scotch_qualification',
          label: 'Qualification (Min Games)',
          type: 'number',
        },
      ],
    },
    {
      title: 'Team Bakers',
      fields: [
        { key: 'team_bakers', label: 'Enable Team Bakers', type: 'check' },
        { key: 'baker_bowlers', label: 'Bowlers per Team', type: 'number' },
        { key: 'baker_games', label: 'Games', type: 'number' },
        { key: 'baker_start_time', label: 'Start Time', type: 'time' },
        { key: 'baker_entry_fee', label: 'Entry Fee', placeholder: 'RM 0.00' },
        {
          key: 'baker_winning_basis',
          label: 'Winning Basis',
          type: 'select',
          options: ['Highest Total Pinfall'],
        },
        {
          key: 'baker_change_bowler_each_game',
          label: 'Allow Bowler Change after Each Game',
          type: 'check',
        },
        {
          key: 'baker_keep_remaining_order',
          label: 'Keep Remaining Bowler Order',
          type: 'check',
        },
        {
          key: 'baker_tie_handling',
          label: 'Tie Breaker',
          type: 'select',
          options: ['Last Game', 'League decides'],
        },
        {
          key: 'baker_champion_prize',
          label: 'Champion',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_second_place_prize',
          label: '2nd Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_third_place_prize',
          label: '3rd Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_fourth_place_prize',
          label: '4th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_fifth_place_prize',
          label: '5th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_sixth_place_prize',
          label: '6th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_7_to_10_prize',
          label: '7th–10th Position',
          placeholder: 'RM 0.00',
        },
        {
          key: 'baker_11_to_31_prize',
          label: '11th–31st Position',
          placeholder: 'RM 0.00',
        },
      ],
    },
    {
      title: 'Jackpot',
      fields: [
        { key: 'jackpot', label: 'Enable Jackpot', type: 'check' },
        {
          key: 'jackpot_contribution',
          label: 'Contribution per Team / Week',
          placeholder: 'RM 10.00',
        },
        {
          key: 'jackpot_carry_forward',
          label: 'Carry Forward Previous Jackpot',
          type: 'toggle',
        },
        {
          key: 'jackpot_carry_forward_amount',
          label: 'Previous Jackpot Amount',
          placeholder: 'RM 0.00',
        },
      ],
    },
  ],
  [
    {
      title: 'Walkover & Forfeiture',
      fields: [
        {
          key: 'walkover_deduction',
          label: 'Walkover Deduction (Pins)',
          type: 'number',
        },
        {
          key: 'walkover_rule',
          label: 'Walkover Rule',
          type: 'select',
          options: [
            'Last 3 Weeks × Walkover',
            'Fixed deduction',
            'League decides',
          ],
        },
        {
          key: 'walkover_target_required',
          label: 'Require Average Minus Deduction Target',
          type: 'check',
        },
        {
          key: 'walkover_unmet_target_peterson_counts',
          label: 'Count Pinfall for Peterson if Target Missed',
          type: 'check',
        },
        {
          key: 'walkover_team_peterson_only',
          label: 'Walkover Team Receives Peterson Points Only',
          type: 'check',
        },
        {
          key: 'blind_fees_forfeited',
          label: 'Forfeit Fees for Blind Scores',
          type: 'check',
        },
        {
          key: 'forfeit_rule',
          label: 'Forfeit Rule',
          type: 'select',
          options: ['Fail to Rule', 'Insufficient players / no show'],
        },
      ],
    },
    {
      title: 'Blind & Other Rules',
      fields: [
        {
          key: 'blind_score',
          label: 'Blind Score (Scratch)',
          type: 'number',
          required: true,
        },
        {
          key: 'no_joining_after_frame',
          label: 'No joining after 3rd frame of 2nd game',
          type: 'check',
        },
        {
          key: 'review_handicap',
          label: 'Review handicap to 0 for promoted bowlers',
          type: 'check',
        },
        {
          key: 'public_holiday',
          label: 'League not held on Public Holiday',
          type: 'check',
        },
        {
          key: 'postponement_limit',
          label: 'Maximum Postponements per Team',
          type: 'number',
        },
        {
          key: 'junior_postponement_limit',
          label: 'Megalanes Junior Postponement Limit',
          type: 'number',
        },
        {
          key: 'postponement_notice_day',
          label: 'Postponement Notice Day',
          type: 'select',
          options: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        {
          key: 'postponement_notice_time',
          label: 'Postponement Notice Cutoff Time',
          type: 'time',
        },
        {
          key: 'postponement_notice_channel',
          label: 'Postponement Notice Channel',
          type: 'select',
          options: ['Group WhatsApp', 'Other'],
        },
        {
          key: 'postponement_notice_parties',
          label: 'Notify These Parties',
          placeholder: 'Center Supervisor and Opponent Team',
        },
        {
          key: 'post_bowl_cutoff_day',
          label: 'Cut-off Day for Post-bowl',
          type: 'select',
          options: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        {
          key: 'no_post_bowl_walkover_week',
          label: 'No Post-bowl / Walkover from Week',
          type: 'number',
        },
        {
          key: 'no_postponements_week',
          label: 'No Postponements in Week',
          type: 'number',
        },
        {
          key: 'allow_pre_bowl_restricted_week',
          label: 'Allow Pre-bowl in Restricted Week',
          type: 'check',
        },
        {
          key: 'fasting_month_rule',
          label: 'Apply Fasting Month Pre/Post-bowl Rule',
          type: 'check',
        },
        { key: 'dong_code', label: 'Dong Code (Admin)', type: 'text' },
      ],
    },
  ],
  [],
];

export const initialLeagueSetupValues: BlockSetupDialogFormValues = {
  league_format: 'Head to Head',
  number_of_weeks: '12',
  number_of_teams: '0',
  number_of_blocks: '1',
  league_day: '',
  commencement_date: '',
  end_date: '',
  schedule_weeks: '',
  practice_time: '',
  game_start_time: '',
  late_cutoff: '',
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
  team_win_points: '0',
  team_loss_points: '0',
  team_tie_points: '0',
  game_win_points: '0',
  series_win_points: '0',
  enable_peterson: false,
  peterson_points: '0',
  enable_handicap: false,
  calculation_method: '',
  base_average: '0',
  handicap_percentage: '0',
  games_for_average: '0',
  men_maximum: '0',
  ladies_maximum: '0',
  round_handicap: false,
  promote_handicap: false,
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
  allow_pre_bowl: false,
  allow_post_bowl: false,
  block_post_bowl_final: false,
  team_high_series: false,
  team_above_average: false,
  individual_high_game: false,
  individual_high_series: false,
};

export const leagueSetupFields: BlockSetupDialogField[] = [
  { key: 'season_name', label: 'Season Name / Label', required: true },
  {
    key: 'league_format',
    label: 'League Format',
    type: 'select',
    options: ['Head to Head', 'Baker', 'Individual'],
  },
  {
    key: 'number_of_blocks',
    label: 'No. of Rounds',
    type: 'number',
    required: true,
  },
  {
    key: 'number_of_teams',
    label: 'No. of Teams',
    type: 'number',
    required: true,
    hint: 'Enter the actual teams. One Blind team is added for scheduling when this count is odd.',
  },
  {
    key: 'number_of_weeks',
    label: 'No. of Weeks',
    type: 'number',
    required: true,
    hint: 'Calculated automatically from rounds and teams, including a Blind team when the team count is odd.',
  },
  {
    key: 'games_per_week',
    label: 'Games per Week',
    type: 'number',
    required: true,
  },
  {
    key: 'players_per_game',
    label: 'Players per Game',
    type: 'number',
    required: true,
  },
  {
    key: 'total_lanes',
    label: 'Total Lanes',
    type: 'number',
    required: true,
  },
  {
    key: 'starting_lane',
    label: 'Starting Lane',
    type: 'number',
    required: true,
    hint: 'Leave enough lanes after this lane for every scheduled team, including a Blind team when the team count is odd.',
  },
];

export const handicapSettingFields = [
  'calculation_method',
  'base_average',
  'handicap_percentage',
  'games_for_average',
  'men_maximum',
  'ladies_maximum',
  'round_handicap',
  'promote_handicap',
];
export const perfectGamePrizeFields = [
  'perfect_game_round1_prize',
  'perfect_game_round2_prize',
  'perfect_game_share_winners',
  'perfect_game_carry_forward',
];
export const weeklyPrizeFields = [
  'weekly_individual_high_game_hcp_games',
  'weekly_individual_high_series_hcp_games',
  'weekly_team_high_game_hcp_games',
  'weekly_team_high_series_hcp_games',
];
export const finalPrizeFields = [
  'final_champion_prize',
  'final_second_place_prize',
  'final_third_place_prize',
  'final_fourth_place_prize',
  'final_fifth_place_prize',
  'final_sixth_place_prize',
  'final_seventh_place_prize',
  'final_eighth_place_prize',
  'final_ninth_place_prize',
  'final_10_to_20_prize',
  'final_21_to_31_prize',
];
export const bakerEventFields = [
  'baker_bowlers',
  'baker_games',
  'baker_start_time',
  'baker_entry_fee',
  'baker_winning_basis',
  'baker_change_bowler_each_game',
  'baker_keep_remaining_order',
  'baker_tie_handling',
  'baker_champion_prize',
  'baker_second_place_prize',
  'baker_third_place_prize',
  'baker_fourth_place_prize',
  'baker_fifth_place_prize',
  'baker_sixth_place_prize',
  'baker_7_to_10_prize',
  'baker_11_to_31_prize',
];
export const jackpotEventFields = [
  'jackpot_contribution',
  'jackpot_carry_forward',
  'jackpot_carry_forward_amount',
];
export const scotchEventFields = [
  'scotch_max_pairs',
  'scotch_games',
  'scotch_entry_fee',
  'scotch_qualification',
];
export const finalHandicapAwardDependency: Record<string, string> = {
  final_team_high_series_hcp_prize: 'award_team_series',
  final_team_high_game_hcp_prize: 'award_team_high_game_handicap',
  final_individual_high_series_hcp_prize:
    'award_individual_high_series_handicap',
  final_individual_high_game_hcp_prize: 'award_high_handicap',
};
