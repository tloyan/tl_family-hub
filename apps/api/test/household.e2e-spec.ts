import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { createTestUser } from './helpers/auth.helper';
import { cleanDatabase } from './helpers/db.helper';

const HOUSEHOLD_FIELDS = `
  id
  name
  membersCount
  createdAt
  members {
    id
    role
    color
    joinedAt
    userId
    userName
    userEmail
  }
`;

function gql(query: string, variables?: Record<string, unknown>) {
  return { query, variables };
}

describe('Household (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma.bypassHouseholdFilter());
  });

  async function graphqlRequest(
    body: { query: string; variables?: Record<string, unknown> },
    headers: Record<string, string> = {},
  ) {
    const req = request(app.getHttpServer()).post('/graphql');
    for (const [key, value] of Object.entries(headers)) {
      req.set(key, value);
    }
    return req.send(body);
  }

  // ── CRUD flow (T8.3) ──────────────────────────────────────────────────

  describe('CRUD flow', () => {
    it('createHousehold returns household with id, name, membersCount=1, owner with color #FF6B6B', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const res = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { ${HOUSEHOLD_FIELDS} }
          }`,
          { input: { name: 'My Family' } },
        ),
        headers,
      );

      expect(res.body.errors).toBeUndefined();
      const household = res.body.data.createHousehold;
      expect(household.id).toBeDefined();
      expect(household.name).toBe('My Family');
      expect(household.membersCount).toBe(1);
      expect(household.members).toHaveLength(1);
      expect(household.members[0].role).toBe('OWNER');
      expect(household.members[0].color).toBe('#FF6B6B');
    });

    it('creates 5 circles in DB after createHousehold', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const res = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Family' } },
        ),
        headers,
      );

      const householdId = res.body.data.createHousehold.id;
      const circles = await prisma
        .bypassHouseholdFilter()
        .circle.findMany({ where: { householdId } });
      expect(circles).toHaveLength(5);
      const types = circles.map((c) => c.type).sort();
      expect(types).toEqual([
        'ACQUAINTANCES',
        'COUPLE',
        'EXTENDED_FAMILY',
        'HOUSEHOLD',
        'PERSONAL',
      ]);
    });

    it('second createHousehold for same user returns HOUSEHOLD_ALREADY_EXISTS', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'First' } },
        ),
        headers,
      );

      const res = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Second' } },
        ),
        headers,
      );

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('already has a household');
    });

    it('myHousehold returns the created household', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'My Family' } },
        ),
        headers,
      );

      const res = await graphqlRequest(
        gql(`query { myHousehold { ${HOUSEHOLD_FIELDS} } }`),
        headers,
      );

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.myHousehold.name).toBe('My Family');
    });

    it('myHousehold returns null for user with no household', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const res = await graphqlRequest(gql(`query { myHousehold { id } }`), headers);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.myHousehold).toBeNull();
    });

    it('household(id) with valid x-household-id header returns data', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const createRes = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Family' } },
        ),
        headers,
      );
      const householdId = createRes.body.data.createHousehold.id;

      const res = await graphqlRequest(
        gql(`query($id: ID!) { household(id: $id) { ${HOUSEHOLD_FIELDS} } }`, { id: householdId }),
        { ...headers, 'x-household-id': householdId },
      );

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.household.id).toBe(householdId);
      expect(res.body.data.household.name).toBe('Family');
    });

    it('household(id) without x-household-id header returns HOUSEHOLD_HEADER_MISSING', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const createRes = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Family' } },
        ),
        headers,
      );
      const householdId = createRes.body.data.createHousehold.id;

      const res = await graphqlRequest(
        gql(`query($id: ID!) { household(id: $id) { id } }`, { id: householdId }),
        headers,
      );

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('x-household-id header is required');
    });

    it('updateHousehold updates name successfully', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Original' } },
        ),
        headers,
      );

      const res = await graphqlRequest(
        gql(
          `mutation($input: UpdateHouseholdInput!) {
            updateHousehold(input: $input) { ${HOUSEHOLD_FIELDS} }
          }`,
          { input: { name: 'Updated' } },
        ),
        headers,
      );

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.updateHousehold.name).toBe('Updated');
    });

    it('deleteHousehold returns true, myHousehold then returns null', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'To Delete' } },
        ),
        headers,
      );

      const deleteRes = await graphqlRequest(gql(`mutation { deleteHousehold }`), headers);
      expect(deleteRes.body.errors).toBeUndefined();
      expect(deleteRes.body.data.deleteHousehold).toBe(true);

      const queryRes = await graphqlRequest(gql(`query { myHousehold { id } }`), headers);
      expect(queryRes.body.data.myHousehold).toBeNull();
    });

    it('rejects empty name with validation error', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const res = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: '' } },
        ),
        headers,
      );

      expect(res.body.errors).toBeDefined();
    });

    it('rejects name > 100 chars with validation error', async () => {
      const { headers } = await createTestUser(prisma.bypassHouseholdFilter());

      const res = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'a'.repeat(101) } },
        ),
        headers,
      );

      expect(res.body.errors).toBeDefined();
    });
  });

  // ── Cross-household isolation (T8.4) ──────────────────────────────────

  describe('cross-household isolation', () => {
    let userA: { userId: string; headers: Record<string, string> };
    let userB: { userId: string; headers: Record<string, string> };
    let householdAId: string;
    let householdBId: string;

    beforeEach(async () => {
      const bp = prisma.bypassHouseholdFilter();
      userA = await createTestUser(bp, { name: 'User A', email: 'a@test.com' });
      userB = await createTestUser(bp, { name: 'User B', email: 'b@test.com' });

      const resA = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Household A' } },
        ),
        userA.headers,
      );
      householdAId = resA.body.data.createHousehold.id;

      const resB = await graphqlRequest(
        gql(
          `mutation($input: CreateHouseholdInput!) {
            createHousehold(input: $input) { id }
          }`,
          { input: { name: 'Household B' } },
        ),
        userB.headers,
      );
      householdBId = resB.body.data.createHousehold.id;
    });

    it('user A cannot use x-household-id of household B (not a member)', async () => {
      const res = await graphqlRequest(
        gql(`query($id: ID!) { household(id: $id) { id } }`, { id: householdBId }),
        { ...userA.headers, 'x-household-id': householdBId },
      );

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Access to this household is denied');
    });

    it('user A cannot query household B with own x-household-id', async () => {
      const res = await graphqlRequest(
        gql(`query($id: ID!) { household(id: $id) { id } }`, { id: householdBId }),
        { ...userA.headers, 'x-household-id': householdAId },
      );

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Access to this household is denied');
    });

    it('myHousehold for user A returns only A household', async () => {
      const res = await graphqlRequest(gql(`query { myHousehold { id name } }`), userA.headers);

      expect(res.body.data.myHousehold.id).toBe(householdAId);
      expect(res.body.data.myHousehold.name).toBe('Household A');
    });

    it('prisma.forHousehold(A) returns only A members', async () => {
      const members = await prisma.forHousehold(householdAId).householdMember.findMany();

      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe(userA.userId);
      expect(members[0].householdId).toBe(householdAId);
    });

    it('prisma.forHousehold(A) returns only A circles', async () => {
      const circles = await prisma.forHousehold(householdAId).circle.findMany();

      expect(circles).toHaveLength(5);
      for (const circle of circles) {
        expect(circle.householdId).toBe(householdAId);
      }
    });
  });
});
