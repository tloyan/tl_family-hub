import type { Metadata } from 'next';
import { query } from '@/lib/apollo-server';
import { INVITATION_BY_TOKEN_QUERY } from '@/features/household/graphql';
import { InvitationStatus } from '@family-hub/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_LABELS, RELATION_LABELS, STATUS_LABELS } from '@/features/household/constants';
import { AcceptInvitationClient } from './accept-invitation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  try {
    const { data } = await query({
      query: INVITATION_BY_TOKEN_QUERY,
      variables: { token },
    });

    if (data?.invitationByToken) {
      const inv = data.invitationByToken;
      return {
        title: `Rejoindre ${inv.householdName} — Family Hub`,
        openGraph: {
          title: `Rejoindre ${inv.householdName} — Family Hub`,
          description: `Invité par ${inv.inviterName} · Rôle : ${ROLE_LABELS[inv.role] ?? inv.role} · Relation : ${RELATION_LABELS[inv.relation] ?? inv.relation}`,
          type: 'website',
        },
      };
    }
  } catch {
    // Fallback to static metadata
  }

  return {
    title: 'Invitation — Family Hub',
  };
}

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data, error } = await query({
    query: INVITATION_BY_TOKEN_QUERY,
    variables: { token },
  });

  if (error || !data?.invitationByToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation introuvable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Cette invitation n&apos;existe pas ou a été supprimée.
          </p>
        </CardContent>
      </Card>
    );
  }

  const invitation = data.invitationByToken;
  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isPending = invitation.status === InvitationStatus.PENDING && !isExpired;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejoindre {invitation.householdName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Invité par :</span>{' '}
            <span className="font-medium">{invitation.inviterName}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Rôle :</span>{' '}
            <span className="font-medium">{ROLE_LABELS[invitation.role] ?? invitation.role}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Relation :</span>{' '}
            <span className="font-medium">
              {RELATION_LABELS[invitation.relation] ?? invitation.relation}
            </span>
          </p>
        </div>

        {isPending ? (
          <AcceptInvitationClient token={token} />
        ) : (
          <div className="rounded-md border p-4 text-center">
            <p className="text-muted-foreground text-sm">
              {invitation.status === InvitationStatus.ACCEPTED
                ? 'Cette invitation a déjà été acceptée.'
                : invitation.status === InvitationStatus.CANCELLED
                  ? 'Cette invitation a été annulée.'
                  : `Cette invitation est ${(STATUS_LABELS[invitation.status] ?? invitation.status).toLowerCase()}.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
