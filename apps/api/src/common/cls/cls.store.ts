import type { ClsStore } from 'nestjs-cls';

export interface AppClsStore extends ClsStore {
  householdId?: string;
}
