'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { MY_HOUSEHOLD_QUERY } from '../graphql';
import { HouseholdNameEditor } from './household-name-editor';
import { MembersList } from './members-list';
import { DangerZone } from './danger-zone';

export function HouseholdDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(MY_HOUSEHOLD_QUERY);

  const hasHousehold = !!data?.myHousehold;

  useEffect(() => {
    if (!loading && !error && !hasHousehold) {
      router.replace('/household/create');
    }
  }, [loading, error, hasHousehold, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-16">
        <p className="text-muted-foreground text-sm">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center pt-16">
        <p className="text-destructive text-sm">
          Impossible de charger le foyer. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (!data?.myHousehold) {
    return null;
  }

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
