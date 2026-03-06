import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { query } from '@/lib/apollo-server';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { CreateInvitationForm } from '@/features/household/components/create-invitation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBackLink } from '@/components/page-back-link';

export const metadata: Metadata = {
  title: 'Inviter un membre — Family Hub',
};

export default async function InvitePage() {
  const { data, error } = await query({ query: MY_HOUSEHOLD_QUERY });

  if (error) throw new Error(error.message);
  if (!data?.myHousehold) redirect('/household/create');

  return (
    <div className="mx-auto max-w-md">
      <PageBackLink href="/household" label="Retour au foyer" />
      <Card>
        <CardHeader>
          <CardTitle>Inviter un membre</CardTitle>
          <CardDescription>
            Créez un lien d&apos;invitation pour ajouter un membre au foyer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateInvitationForm
            householdId={data.myHousehold.id}
            unlinkedMembers={data.myHousehold.members.filter((m) => !m.userId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
