import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { query } from '@/lib/apollo-server';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { CreateMemberForm } from '@/features/household/components/create-member-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBackLink } from '@/components/page-back-link';

export const metadata: Metadata = {
  title: 'Ajouter un membre — Family Hub',
};

export default async function CreateMemberPage() {
  const { data, error } = await query({ query: MY_HOUSEHOLD_QUERY });

  if (error) throw new Error(error.message);
  if (!data?.myHousehold) redirect('/household/create');

  return (
    <div className="mx-auto max-w-md">
      <PageBackLink href="/household" label="Retour au foyer" />
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un membre</CardTitle>
          <CardDescription>
            Créez un profil pour un membre du foyer qui n&apos;a pas encore de compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateMemberForm householdId={data.myHousehold.id} redirectOnCreated />
        </CardContent>
      </Card>
    </div>
  );
}
