import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/apollo-server';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { Button } from '@/components/ui/button';
import { HouseholdNameEditor } from '@/features/household/components/household-name-editor';
import { MembersList } from '@/features/household/components/members-list';
import { InvitationList } from '@/features/household/components/invitation-list';
import { DangerZone } from '@/features/household/components/danger-zone';
import { PendingInviteBanner } from './create/pending-invite-banner';

export const metadata: Metadata = {
  title: 'Mon foyer — Family Hub',
};

export default async function HouseholdPage() {
  const { data, error } = await query({ query: MY_HOUSEHOLD_QUERY });

  if (error) throw new Error(error.message);

  if (!data?.myHousehold) {
    return (
      <div className="flex flex-col items-center pt-16">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">Bienvenue sur Family Hub</h1>
              <p className="text-muted-foreground text-sm">
                Vous n&apos;avez pas encore de foyer. Créez-en un ou rejoignez un foyer existant via
                une invitation.
              </p>
            </div>
            <PendingInviteBanner />
            <Button asChild className="h-11 w-full">
              <Link href="/household/create">Créer un foyer</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { id, name, membersCount, members } = data.myHousehold;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <HouseholdNameEditor name={name} members={members} />
        <p className="text-muted-foreground text-sm">
          {membersCount} {membersCount > 1 ? 'membres' : 'membre'}
        </p>
      </div>

      <MembersList members={members} householdId={id} />
      <InvitationList householdId={id} members={members} />
      <DangerZone householdName={name} members={members} />
    </div>
  );
}
