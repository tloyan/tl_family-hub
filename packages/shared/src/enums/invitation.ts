export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const InvitationRelation = {
  PARENT: 'PARENT',
  GRANDPARENT: 'GRANDPARENT',
  UNCLE_AUNT: 'UNCLE_AUNT',
  SIBLING: 'SIBLING',
  COUSIN: 'COUSIN',
  FRIEND: 'FRIEND',
  NANNY: 'NANNY',
  TUTOR: 'TUTOR',
  OTHER: 'OTHER',
} as const;
export type InvitationRelation = (typeof InvitationRelation)[keyof typeof InvitationRelation];
