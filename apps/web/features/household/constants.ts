import { HouseholdRole } from '@family-hub/shared';

export const ROLE_LABELS: Record<string, string> = {
  [HouseholdRole.OWNER]: 'Propriétaire',
  [HouseholdRole.ADMIN]: 'Administrateur',
  [HouseholdRole.ADULT]: 'Adulte',
  [HouseholdRole.CHILD]: 'Enfant',
  [HouseholdRole.PROVIDER]: 'Prestataire',
};
