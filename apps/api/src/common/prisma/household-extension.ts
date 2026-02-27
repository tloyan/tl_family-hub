import { Prisma } from '@family-hub/db';

const HOUSEHOLD_SCOPED_MODELS = new Set<string>([
  'HouseholdMember',
  'Circle',
  // Future: 'Ritual', 'Invitation', etc.
]);

const FILTERABLE_OPERATIONS = new Set<string>([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

type QueryArgs = Record<string, unknown>;

export function householdExtension(householdId: string) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'householdFilter',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (!HOUSEHOLD_SCOPED_MODELS.has(model)) {
              return query(args);
            }

            const a = args as QueryArgs;

            if (FILTERABLE_OPERATIONS.has(operation)) {
              a.where = { ...(a.where as QueryArgs), householdId };
            } else if (operation === 'create') {
              a.data = { ...(a.data as QueryArgs), householdId };
            } else if (operation === 'createMany') {
              const data = a.data;
              a.data = Array.isArray(data)
                ? data.map((d: QueryArgs) => ({ ...d, householdId }))
                : { ...(data as QueryArgs), householdId };
            } else if (operation === 'upsert') {
              a.where = { ...(a.where as QueryArgs), householdId };
              a.create = { ...(a.create as QueryArgs), householdId };
            }

            return query(args);
          },
        },
      },
    }),
  );
}
