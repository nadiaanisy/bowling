import { clsx, type ClassValue } from 'clsx';
import { LeagueMember, LeagueTeamWithMembers } from '../interfaces';
import { twMerge } from 'tailwind-merge';

/* Merges and deduplicates CSS class names using Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Sorts teams alphabetically by name. */
export const sortTeamsByName = (teams: LeagueTeamWithMembers[]) =>
  [...teams].sort((firstTeam, secondTeam) =>
    firstTeam.name.localeCompare(secondTeam.name, undefined, {
      sensitivity: 'base',
    }),
  );

/* Sorts team members alphabetically by name. */
export const sortMembersByName = (members: LeagueMember[]) =>
  [...members].sort((firstMember, secondMember) =>
    firstMember.name.localeCompare(secondMember.name, undefined, {
      sensitivity: 'base',
    }),
  );
