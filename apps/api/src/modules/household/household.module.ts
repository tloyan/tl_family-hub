import { Module } from '@nestjs/common';
import { HouseholdResolver } from './household.resolver';
import { HouseholdService } from './household.service';
import { HouseholdRepository } from './household.repository';

@Module({
  providers: [HouseholdResolver, HouseholdService, HouseholdRepository],
})
export class HouseholdModule {}
