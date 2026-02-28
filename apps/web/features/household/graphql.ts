import { gql, type TypedDocumentNode } from '@apollo/client/core';
import type { HouseholdRole } from '@family-hub/shared';

// ── Types ──────────────────────────────────────────────────────────────

export interface HouseholdMember {
  __typename?: 'HouseholdMember';
  id: string;
  role: (typeof HouseholdRole)[keyof typeof HouseholdRole];
  color: string;
  joinedAt: string;
  userId: string;
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
