import { HouseholdRole, InvitationRelation, InvitationStatus } from '@family-hub/shared';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

export const ROLE_LABELS: Record<string, string> = {
  [HouseholdRole.OWNER]: 'Propriétaire',
  [HouseholdRole.ADMIN]: 'Administrateur',
  [HouseholdRole.ADULT]: 'Adulte',
  [HouseholdRole.CHILD]: 'Enfant',
  [HouseholdRole.PROVIDER]: 'Prestataire',
};

export const RELATION_LABELS: Record<string, string> = {
  [InvitationRelation.PARENT]: 'Parent',
  [InvitationRelation.GRANDPARENT]: 'Grand-parent',
  [InvitationRelation.UNCLE_AUNT]: 'Oncle / Tante',
  [InvitationRelation.SIBLING]: 'Frère / Soeur',
  [InvitationRelation.COUSIN]: 'Cousin(e)',
  [InvitationRelation.FRIEND]: 'Ami(e)',
  [InvitationRelation.NANNY]: 'Nounou',
  [InvitationRelation.TUTOR]: 'Tuteur / Tutrice',
  [InvitationRelation.OTHER]: 'Autre',
};

export const STATUS_LABELS: Record<string, string> = {
  [InvitationStatus.PENDING]: 'En attente',
  [InvitationStatus.ACCEPTED]: 'Acceptée',
  [InvitationStatus.EXPIRED]: 'Expirée',
  [InvitationStatus.CANCELLED]: 'Annulée',
};

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  [InvitationStatus.PENDING]: 'outline',
  [InvitationStatus.ACCEPTED]: 'default',
  [InvitationStatus.EXPIRED]: 'secondary',
  [InvitationStatus.CANCELLED]: 'destructive',
};

export function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

export const ROLE_ALLOWED_RELATIONS: Record<string, string[]> = {
  [HouseholdRole.ADMIN]: [
    InvitationRelation.PARENT,
    InvitationRelation.GRANDPARENT,
    InvitationRelation.UNCLE_AUNT,
    InvitationRelation.SIBLING,
    InvitationRelation.COUSIN,
    InvitationRelation.FRIEND,
    InvitationRelation.OTHER,
  ],
  [HouseholdRole.ADULT]: [
    InvitationRelation.PARENT,
    InvitationRelation.GRANDPARENT,
    InvitationRelation.UNCLE_AUNT,
    InvitationRelation.SIBLING,
    InvitationRelation.COUSIN,
    InvitationRelation.FRIEND,
    InvitationRelation.OTHER,
  ],
  [HouseholdRole.CHILD]: [
    InvitationRelation.SIBLING,
    InvitationRelation.COUSIN,
    InvitationRelation.FRIEND,
    InvitationRelation.OTHER,
  ],
  [HouseholdRole.PROVIDER]: [
    InvitationRelation.NANNY,
    InvitationRelation.TUTOR,
    InvitationRelation.OTHER,
  ],
};
