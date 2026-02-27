import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

export class HouseholdNotFoundException extends NotFoundException {
  constructor() {
    super({ code: 'HOUSEHOLD_NOT_FOUND', message: 'Household not found' });
  }
}

export class HouseholdAlreadyExistsException extends ConflictException {
  constructor() {
    super({ code: 'HOUSEHOLD_ALREADY_EXISTS', message: 'User already has a household' });
  }
}

export class HouseholdAccessDeniedException extends ForbiddenException {
  constructor() {
    super({ code: 'HOUSEHOLD_ACCESS_DENIED', message: 'Access to this household is denied' });
  }
}
