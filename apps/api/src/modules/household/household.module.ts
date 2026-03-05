import { Module } from '@nestjs/common';
import { HouseholdResolver } from './household.resolver';
import { HouseholdService } from './household.service';
import { HouseholdRepository } from './household.repository';
import { InvitationResolver } from './invitation.resolver';
import { InvitationService } from './invitation.service';
import { InvitationRepository } from './invitation.repository';

@Module({
  providers: [
    HouseholdResolver,
    HouseholdService,
    HouseholdRepository,
    InvitationResolver,
    InvitationService,
    InvitationRepository,
  ],
})
export class HouseholdModule {}
