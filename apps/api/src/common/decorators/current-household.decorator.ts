import { createParamDecorator, InternalServerErrorException } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';
import type { AppClsStore } from '../cls/cls.store';

export const CurrentHousehold = createParamDecorator((): string => {
  const cls = ClsServiceManager.getClsService<AppClsStore>();
  const householdId = cls.get('householdId');

  if (!householdId) {
    throw new InternalServerErrorException(
      'HouseholdGuard must be applied to use @CurrentHousehold()',
    );
  }

  return householdId;
});
