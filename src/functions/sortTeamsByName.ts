import { LeagueTeamWithMembers } from '../utils/interfaces';

/* Sorts teams alphabetically by name. */
export const sortTeamsByName = (teams: LeagueTeamWithMembers[]) =>
  [...teams].sort((firstTeam, secondTeam) =>
    firstTeam.name.localeCompare(secondTeam.name, undefined, {
      sensitivity: 'base',
    }),
  );
