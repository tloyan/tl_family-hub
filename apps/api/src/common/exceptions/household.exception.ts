import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

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

export class HouseholdHeaderMissingException extends BadRequestException {
  constructor() {
    super({ code: 'HOUSEHOLD_HEADER_MISSING', message: 'x-household-id header is required' });
  }
}
