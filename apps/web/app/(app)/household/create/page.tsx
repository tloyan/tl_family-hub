import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { query } from '@/lib/apollo-server';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { CreateHouseholdForm } from '@/features/household/components/create-household-form';
import { PendingInviteBanner } from './pending-invite-banner';

export const metadata: Metadata = {
  title: 'Bienvenue — Family Hub',
};

export default async function CreateHouseholdPage() {
  let hasHousehold = false;
  try {
    const { data } = await query({ query: MY_HOUSEHOLD_QUERY });
    hasHousehold = !!data?.myHousehold;
  } catch {
    // API unreachable — show the form anyway; mutation will fail with a clear error
  }

  if (hasHousehold) redirect('/household');

  return (
    <div className="flex flex-col items-center pt-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold">Créer votre foyer</h1>
            <p className="text-muted-foreground text-sm">
              Donnez un nom à votre foyer pour commencer
            </p>
          </div>
          <PendingInviteBanner />
          <CreateHouseholdForm />
        </div>
      </div>
    </div>
  );
}
