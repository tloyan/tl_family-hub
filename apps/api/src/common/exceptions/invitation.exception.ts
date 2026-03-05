import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';

export class InvitationNotFoundException extends NotFoundException {
  constructor() {
    super({ code: 'INVITATION_NOT_FOUND', message: 'Invitation not found' });
  }
}

export class InvitationExpiredException extends GoneException {
  constructor() {
    super({ code: 'INVITATION_EXPIRED', message: 'Invitation has expired' });
  }
}

export class InvitationAlreadyAcceptedException extends ConflictException {
  constructor() {
    super({ code: 'INVITATION_ALREADY_ACCEPTED', message: 'Invitation has already been accepted' });
  }
}

export class InvitationCancelledException extends GoneException {
  constructor() {
    super({ code: 'INVITATION_CANCELLED', message: 'Invitation has been cancelled' });
  }
}

export class InvitationLimitReachedException extends ConflictException {
  constructor() {
    super({ code: 'INVITATION_LIMIT_REACHED', message: 'Invitation limit has been reached' });
  }
}

export class NotInvitationOwnerException extends ForbiddenException {
  constructor() {
    super({
      code: 'NOT_INVITATION_OWNER',
      message: 'Only household owners or admins can manage invitations',
    });
  }
}

export class CannotInviteSelfException extends BadRequestException {
  constructor() {
    super({
      code: 'CANNOT_INVITE_SELF',
      message: 'You are already a member of this household',
    });
  }
}

export class InvitationInputInvalidException extends BadRequestException {
  constructor() {
    super({ code: 'INVITATION_INPUT_INVALID', message: 'Invitation input is invalid' });
  }
}
