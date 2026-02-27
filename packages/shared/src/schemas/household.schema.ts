import { z } from 'zod';

export const createHouseholdInput = z.object({
  name: z.string().trim().min(1).max(100),
});
export type CreateHouseholdInput = z.infer<typeof createHouseholdInput>;
