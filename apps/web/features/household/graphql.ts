import { gql, type TypedDocumentNode } from '@apollo/client/core';
import type { HouseholdRole, InvitationStatus } from '@family-hub/shared';

// ── Types ──────────────────────────────────────────────────────────────

export interface HouseholdMember {
  __typename?: 'HouseholdMember';
  id: string;
  role: (typeof HouseholdRole)[keyof typeof HouseholdRole];
  color: string;
  displayName: string | null;
  relation: string | null;
  joinedAt: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
}

export interface Household {
  __typename?: 'Household';
  id: string;
  name: string;
  membersCount: number;
  createdAt: string;
  members: HouseholdMember[];
}

// ── Fragments ─────────────────────────────────────────────────────────

export const HOUSEHOLD_MEMBER_FIELDS = gql`
  fragment HouseholdMemberFields on HouseholdMember {
    id
    role
    color
    displayName
    relation
    joinedAt
    userId
    userName
    userEmail
  }
`;

export const HOUSEHOLD_FIELDS = gql`
  fragment HouseholdFields on Household {
    id
    name
    membersCount
    createdAt
    members {
      ...HouseholdMemberFields
    }
  }
  ${HOUSEHOLD_MEMBER_FIELDS}
`;

// ── Queries ────────────────────────────────────────────────────────────

export interface MyHouseholdData {
  myHousehold: Household | null;
}

export const MY_HOUSEHOLD_QUERY: TypedDocumentNode<MyHouseholdData> = gql`
  query MyHousehold {
    myHousehold {
      ...HouseholdFields
    }
  }
  ${HOUSEHOLD_FIELDS}
`;

// ── Mutations ──────────────────────────────────────────────────────────

export interface CreateHouseholdData {
  createHousehold: Household;
}

export interface CreateHouseholdVariables {
  input: { name: string };
}

export const CREATE_HOUSEHOLD_MUTATION: TypedDocumentNode<
  CreateHouseholdData,
  CreateHouseholdVariables
> = gql`
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      ...HouseholdFields
    }
  }
  ${HOUSEHOLD_FIELDS}
`;

// ── Update Household ──────────────────────────────────────────────────

export interface UpdateHouseholdData {
  updateHousehold: Household;
}

export interface UpdateHouseholdVariables {
  input: { name: string };
}

export const UPDATE_HOUSEHOLD_MUTATION: TypedDocumentNode<
  UpdateHouseholdData,
  UpdateHouseholdVariables
> = gql`
  mutation UpdateHousehold($input: UpdateHouseholdInput!) {
    updateHousehold(input: $input) {
      ...HouseholdFields
    }
  }
  ${HOUSEHOLD_FIELDS}
`;

// ── Delete Household ──────────────────────────────────────────────────

export interface DeleteHouseholdData {
  deleteHousehold: boolean;
}

export const DELETE_HOUSEHOLD_MUTATION: TypedDocumentNode<DeleteHouseholdData> = gql`
  mutation DeleteHousehold {
    deleteHousehold
  }
`;

// ── Create Member Profile ─────────────────────────────────────────────

export interface CreateMemberProfileData {
  createMemberProfile: HouseholdMember;
}

export interface CreateMemberProfileVariables {
  input: { displayName: string; role: string; relation: string };
}

export const CREATE_MEMBER_PROFILE_MUTATION: TypedDocumentNode<
  CreateMemberProfileData,
  CreateMemberProfileVariables
> = gql`
  mutation CreateMemberProfile($input: CreateMemberProfileInput!) {
    createMemberProfile(input: $input) {
      ...HouseholdMemberFields
    }
  }
  ${HOUSEHOLD_MEMBER_FIELDS}
`;

// ── Update Member Profile ─────────────────────────────────────────────

export interface UpdateMemberProfileData {
  updateMemberProfile: HouseholdMember;
}

export interface UpdateMemberProfileVariables {
  input: { id: string; displayName: string };
}

export const UPDATE_MEMBER_PROFILE_MUTATION: TypedDocumentNode<
  UpdateMemberProfileData,
  UpdateMemberProfileVariables
> = gql`
  mutation UpdateMemberProfile($input: UpdateMemberProfileInput!) {
    updateMemberProfile(input: $input) {
      ...HouseholdMemberFields
    }
  }
  ${HOUSEHOLD_MEMBER_FIELDS}
`;

// ── Invitation Types ──────────────────────────────────────────────────

export interface Invitation {
  __typename?: 'Invitation';
  id: string;
  token: string;
  role: (typeof HouseholdRole)[keyof typeof HouseholdRole];
  relation: string;
  status: InvitationStatus;
  email?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  householdId: string;
  invitedByUserId: string;
  invitedByUserName?: string | null;
  acceptedByUserId?: string | null;
  linkedMemberProfileId?: string | null;
}

export interface MemberPreview {
  __typename?: 'MemberPreview';
  id: string;
  color: string;
  role: (typeof HouseholdRole)[keyof typeof HouseholdRole];
}

export interface InvitationPublic {
  __typename?: 'InvitationPublic';
  householdName: string;
  inviterName: string;
  role: (typeof HouseholdRole)[keyof typeof HouseholdRole];
  relation: string;
  status: InvitationStatus;
  expiresAt: string;
  linkedMemberProfile?: MemberPreview | null;
}

// ── Invitation Fragment ───────────────────────────────────────────────

export const INVITATION_FIELDS = gql`
  fragment InvitationFields on Invitation {
    id
    token
    role
    relation
    status
    email
    expiresAt
    acceptedAt
    createdAt
    householdId
    invitedByUserId
    invitedByUserName
    acceptedByUserId
    linkedMemberProfileId
  }
`;

// ── Invitation Queries ────────────────────────────────────────────────

export interface HouseholdInvitationsData {
  householdInvitations: Invitation[];
}

export const HOUSEHOLD_INVITATIONS_QUERY: TypedDocumentNode<HouseholdInvitationsData> = gql`
  query HouseholdInvitations {
    householdInvitations {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}
`;

export interface InvitationByTokenData {
  invitationByToken: InvitationPublic;
}

export interface InvitationByTokenVariables {
  token: string;
}

export const INVITATION_BY_TOKEN_QUERY: TypedDocumentNode<
  InvitationByTokenData,
  InvitationByTokenVariables
> = gql`
  query InvitationByToken($token: String!) {
    invitationByToken(token: $token) {
      householdName
      inviterName
      role
      relation
      status
      expiresAt
      linkedMemberProfile {
        id
        color
        role
      }
    }
  }
`;

// ── Invitation Mutations ──────────────────────────────────────────────

export interface CreateInvitationData {
  createInvitation: Invitation;
}

export interface CreateInvitationVariables {
  input: {
    role: string;
    relation: string;
    email?: string;
    linkedMemberProfileId?: string;
  };
}

export const CREATE_INVITATION_MUTATION: TypedDocumentNode<
  CreateInvitationData,
  CreateInvitationVariables
> = gql`
  mutation CreateInvitation($input: CreateInvitationInput!) {
    createInvitation(input: $input) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}
`;

export interface AcceptInvitationData {
  acceptInvitation: HouseholdMember;
}

export interface AcceptInvitationVariables {
  input: { token: string };
}

export const ACCEPT_INVITATION_MUTATION: TypedDocumentNode<
  AcceptInvitationData,
  AcceptInvitationVariables
> = gql`
  mutation AcceptInvitation($input: AcceptInvitationInput!) {
    acceptInvitation(input: $input) {
      ...HouseholdMemberFields
    }
  }
  ${HOUSEHOLD_MEMBER_FIELDS}
`;

export interface CancelInvitationData {
  cancelInvitation: Invitation;
}

export interface CancelInvitationVariables {
  id: string;
}

export const CANCEL_INVITATION_MUTATION: TypedDocumentNode<
  CancelInvitationData,
  CancelInvitationVariables
> = gql`
  mutation CancelInvitation($id: ID!) {
    cancelInvitation(id: $id) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}
`;

// ── Invitation Subscriptions ──────────────────────────────────────────

export interface InvitationAcceptedData {
  invitationAccepted: Invitation;
}

export interface InvitationAcceptedVariables {
  householdId: string;
}

export const INVITATION_ACCEPTED_SUBSCRIPTION: TypedDocumentNode<
  InvitationAcceptedData,
  InvitationAcceptedVariables
> = gql`
  subscription InvitationAccepted($householdId: ID!) {
    invitationAccepted(householdId: $householdId) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS}
`;

export interface HouseholdMemberChangedData {
  householdMemberChanged: HouseholdMember;
}

export interface HouseholdMemberChangedVariables {
  householdId: string;
}

export const HOUSEHOLD_MEMBER_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  HouseholdMemberChangedData,
  HouseholdMemberChangedVariables
> = gql`
  subscription HouseholdMemberChanged($householdId: ID!) {
    householdMemberChanged(householdId: $householdId) {
      ...HouseholdMemberFields
    }
  }
  ${HOUSEHOLD_MEMBER_FIELDS}
`;
