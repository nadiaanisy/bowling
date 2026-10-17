import { LeagueMember } from '../utils/interfaces';

/* Sorts team members alphabetically by name. */
export const sortMembersByName = (members: LeagueMember[]) =>
  [...members].sort((firstMember, secondMember) =>
    firstMember.name.localeCompare(secondMember.name, undefined, {
      sensitivity: 'base',
    }),
  );
