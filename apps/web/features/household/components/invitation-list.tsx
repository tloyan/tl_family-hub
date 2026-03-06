'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { InvitationStatus } from '@family-hub/shared';
import { Check, Copy, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSession } from '@/lib/auth-client';
import {
  HOUSEHOLD_INVITATIONS_QUERY,
  CANCEL_INVITATION_MUTATION,
  INVITATION_ACCEPTED_SUBSCRIPTION,
  type HouseholdMember,
} from '../graphql';
import {
  ROLE_LABELS,
  RELATION_LABELS,
  STATUS_LABELS,
  STATUS_VARIANTS,
  isExpired,
} from '../constants';
import { ShareButton } from './share-button';

interface InvitationListProps {
  householdId: string;
  members: HouseholdMember[];
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/invite/${token}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => void handleCopy()} title="Copier le lien">
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export function InvitationList({ householdId, members }: InvitationListProps) {
  const { data: session } = useSession();
  const currentMember = members.find((m) => m.userId === session?.user.id);
  const isOwnerOrAdmin = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';

  const headers = { 'x-household-id': householdId };

  const { data, loading } = useQuery(HOUSEHOLD_INVITATIONS_QUERY, {
    context: { headers },
  });

  useSubscription(INVITATION_ACCEPTED_SUBSCRIPTION, {
    variables: { householdId },
    onData({ client, data: subData }) {
      if (!subData.data) return;
      const accepted = subData.data.invitationAccepted;
      client.cache.updateQuery({ query: HOUSEHOLD_INVITATIONS_QUERY }, (existing) => {
        if (!existing) return existing;
        return {
          householdInvitations: existing.householdInvitations.map((inv) =>
            inv.id === accepted.id ? { ...inv, ...accepted } : inv,
          ),
        };
      });
    },
  });

  const [cancelInvitation] = useMutation(CANCEL_INVITATION_MUTATION, {
    context: { headers },
    update(cache, { data: mutData }) {
      if (!mutData) return;
      const cancelled = mutData.cancelInvitation;
      cache.updateQuery({ query: HOUSEHOLD_INVITATIONS_QUERY }, (existing) => {
        if (!existing) return existing;
        return {
          householdInvitations: existing.householdInvitations.map((inv) =>
            inv.id === cancelled.id ? { ...inv, ...cancelled } : inv,
          ),
        };
      });
    },
  });

  if (!isOwnerOrAdmin) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Chargement…</p>
        </CardContent>
      </Card>
    );
  }

  const invitations = (() => {
    const all = data?.householdInvitations ?? [];
    const grouped = new Map<string, (typeof all)[number]>();
    const ungrouped: (typeof all)[number][] = [];
    for (const inv of all) {
      const key = inv.linkedMemberProfileId ?? inv.email;
      if (!key) {
        ungrouped.push(inv);
        continue;
      }
      const existing = grouped.get(key);
      if (!existing || new Date(inv.createdAt) > new Date(existing.createdAt)) {
        grouped.set(key, inv);
      }
    }
    return [...grouped.values(), ...ungrouped];
  })();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invitations</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link href="/household/invite">
            <Plus className="mr-1 size-4" />
            Inviter
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune invitation pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {invitations.map((invitation) => {
              const isPending =
                invitation.status === InvitationStatus.PENDING && !isExpired(invitation.expiresAt);

              return (
                <li key={invitation.id} className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {invitation.email ?? 'Lien d\u2019invitation'}
                      </span>
                      <Badge variant={STATUS_VARIANTS[invitation.status]}>
                        {isExpired(invitation.expiresAt) &&
                        invitation.status === InvitationStatus.PENDING
                          ? STATUS_LABELS[InvitationStatus.EXPIRED]
                          : (STATUS_LABELS[invitation.status] ?? invitation.status)}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {ROLE_LABELS[invitation.role] ?? invitation.role} &middot;{' '}
                      {RELATION_LABELS[invitation.relation] ?? invitation.relation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isPending && <CopyLinkButton token={invitation.token} />}
                    {isPending && (
                      <ShareButton url={`${window.location.origin}/invite/${invitation.token}`} />
                    )}
                    {isPending && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Annuler l'invitation">
                            <X className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Annuler l&apos;invitation ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Le lien d&apos;invitation ne sera plus valide.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Retour</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                void cancelInvitation({ variables: { id: invitation.id } });
                              }}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Annuler l&apos;invitation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
