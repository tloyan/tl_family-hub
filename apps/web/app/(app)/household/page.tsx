import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { query } from '@/lib/apollo-server';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { HouseholdNameEditor } from '@/features/household/components/household-name-editor';
import { MembersList } from '@/features/household/components/members-list';
import { DangerZone } from '@/features/household/components/danger-zone';

export const metadata: Metadata = {
  title: 'Mon foyer — Family Hub',
};

export default async function HouseholdPage() {
  const { data, error } = await query({ query: MY_HOUSEHOLD_QUERY });

  if (error) throw new Error(error.message);
  if (!data?.myHousehold) redirect('/household/create');

  const { name, membersCount, members } = data.myHousehold;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <HouseholdNameEditor name={name} />
        <p className="text-muted-foreground text-sm">
          {membersCount} {membersCount > 1 ? 'membres' : 'membre'}
        </p>
      </div>

      <MembersList members={members} />
      <DangerZone householdName={name} />
    </div>
  );
}
