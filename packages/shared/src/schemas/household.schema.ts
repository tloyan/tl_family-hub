import { z } from 'zod';

export const createHouseholdInput = z.object({
  name: z.string().trim().min(1).max(100),
});
export type CreateHouseholdInput = z.infer<typeof createHouseholdInput>;

export const updateHouseholdInput = z.object({
  name: z.string().trim().min(1).max(100),
});
export type UpdateHouseholdInput = z.infer<typeof updateHouseholdInput>;

export const createMemberProfileInput = z.object({
  displayName: z.string().trim().min(1).max(100),
  role: z.enum(['ADMIN', 'ADULT', 'CHILD', 'PROVIDER']),
  relation: z.string().trim().min(1).max(50),
});
export type CreateMemberProfileInput = z.infer<typeof createMemberProfileInput>;

export const updateMemberProfileInput = z.object({
  id: z.string().uuid(),
  displayName: z.string().trim().min(1).max(100),
});
export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileInput>;
