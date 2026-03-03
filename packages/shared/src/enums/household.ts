export const HouseholdRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  ADULT: 'ADULT',
  CHILD: 'CHILD',
  PROVIDER: 'PROVIDER',
} as const;
export type HouseholdRole = (typeof HouseholdRole)[keyof typeof HouseholdRole];

export const CircleType = {
  PERSONAL: 'PERSONAL',
  COUPLE: 'COUPLE',
  HOUSEHOLD: 'HOUSEHOLD',
  EXTENDED_FAMILY: 'EXTENDED_FAMILY',
  ACQUAINTANCES: 'ACQUAINTANCES',
} as const;
export type CircleType = (typeof CircleType)[keyof typeof CircleType];
