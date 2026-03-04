import { z } from 'zod';

export const createInvitationInput = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'ADULT', 'CHILD', 'PROVIDER']),
  relation: z.string().trim().min(1).max(50),
  email: z.string().email().max(255).optional(),
  linkedMemberProfileId: z.string().uuid().optional(),
});
export type CreateInvitationInput = z.infer<typeof createInvitationInput>;

export const acceptInvitationInput = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationInput>;
