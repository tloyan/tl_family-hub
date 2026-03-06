'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useSubscription, useMutation } from '@apollo/client/react';
import { updateMemberProfileInput, InvitationStatus, HouseholdRole } from '@family-hub/shared';
import { Pencil, Check, X, Plus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { MemberAvatar } from '@/components/member-avatar';
import { useSession } from '@/lib/auth-client';
import {
  HOUSEHOLD_MEMBER_CHANGED_SUBSCRIPTION,
  HOUSEHOLD_INVITATIONS_QUERY,
  CANCEL_INVITATION_MUTATION,
  INVITATION_ACCEPTED_SUBSCRIPTION,
  UPDATE_MEMBER_PROFILE_MUTATION,
  type HouseholdMember,
  type Invitation,
} from '../graphql';
import {
  ROLE_LABELS,
  RELATION_LABELS,
  STATUS_LABELS,
  STATUS_VARIANTS,
  isExpired,
} from '../constants';
import { InviteMemberDialog } from './invite-member-dialog';
import { ShareButton } from './share-button';

interface MembersListProps {
  members: HouseholdMember[];
  householdId: string;
}

function getLatestInvitationForMember(
  memberId: string,
  invitations: Invitation[],
): Invitation | undefined {
  return invitations
    .filter((inv) => inv.linkedMemberProfileId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function MemberNameEditor({
  member,
  householdId,
  onMemberUpdated,
  canEdit,
}: {
  member: HouseholdMember;
  householdId: string;
  onMemberUpdated: (updated: HouseholdMember) => void;
  canEdit: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const headers = { 'x-household-id': householdId };
  const [updateMember, { loading }] = useMutation(UPDATE_MEMBER_PROFILE_MUTATION, {
    context: { headers },
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const name = member.displayName ?? member.userName ?? member.userEmail ?? 'Membre';

  function startEditing() {
    setEditName(name);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError(null);
  }

  async function saveEdit() {
    const result = updateMemberProfileInput.safeParse({ id: member.id, displayName: editName });
    if (!result.success) {
      setEditError('Le nom doit contenir entre 1 et 100 caracteres.');
      return;
    }

    try {
      const { data } = await updateMember({ variables: { input: result.data } });
      if (data?.updateMemberProfile) onMemberUpdated(data.updateMemberProfile);
      setIsEditing(false);
      setEditError(null);
    } catch {
      setEditError('Impossible de modifier ce membre.');
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            className="h-7 text-sm"
            disabled={loading}
            aria-label="Nom du membre"
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              void saveEdit();
            }}
            disabled={loading}
            aria-label="Enregistrer"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={cancelEditing}
            disabled={loading}
            aria-label="Annuler"
          >
            <X className="size-3.5" />
          </Button>
        </div>
        {editError && (
          <p role="alert" className="text-destructive text-xs">
            {editError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium">{name}</span>
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={startEditing}
          aria-label="Modifier le nom"
        >
          <Pencil className="size-3" />
        </Button>
      )}
    </div>
  );
}

function MemberInvitationActions({
  member,
  invitation,
  householdId,
}: {
  member: HouseholdMember;
  invitation: Invitation | undefined;
  householdId: string;
}) {
  const headers = { 'x-household-id': householdId };

  const [cancelInvitation] = useMutation(CANCEL_INVITATION_MUTATION, {
    context: { headers },
    refetchQueries: [{ query: HOUSEHOLD_INVITATIONS_QUERY, context: { headers } }],
  });

  const isPending =
    invitation &&
    invitation.status === InvitationStatus.PENDING &&
    !isExpired(invitation.expiresAt);

  const displayStatus = invitation
    ? isExpired(invitation.expiresAt) && invitation.status === InvitationStatus.PENDING
      ? InvitationStatus.EXPIRED
      : invitation.status
    : undefined;

  return (
    <div className="flex items-center gap-1">
      {isPending && (
        <>
          <Badge variant={STATUS_VARIANTS[InvitationStatus.PENDING]}>
            {STATUS_LABELS[InvitationStatus.PENDING]}
          </Badge>
          <ShareButton url={`${window.location.origin}/invite/${invitation.token}`} />
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
        </>
      )}
      {!isPending && displayStatus && (
        <Badge variant={STATUS_VARIANTS[displayStatus]}>
          {STATUS_LABELS[displayStatus] ?? displayStatus}
        </Badge>
      )}
      {/* Always mounted so the dialog doesn't unmount when invitation state changes */}
      <InviteMemberDialog member={member} householdId={householdId}>
        <Button
          variant="outline"
          size="sm"
          title="Inviter ce membre"
          className={isPending ? 'hidden' : undefined}
        >
          <Send className="mr-1 size-3.5" />
          Inviter
        </Button>
      </InviteMemberDialog>
    </div>
  );
}

export function MembersList({ members: initialMembers, householdId }: MembersListProps) {
  const [members, setMembers] = useState(initialMembers);
  const { data: session } = useSession();
  const currentUserId = session?.user.id;
  const currentMember = members.find((m) => m.userId === currentUserId);
  const isOwnerOrAdmin =
    currentMember?.role === HouseholdRole.OWNER || currentMember?.role === HouseholdRole.ADMIN;

  function handleMemberUpdated(updated: HouseholdMember) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  const headers = { 'x-household-id': householdId };

  const { data: invitationsData } = useQuery(HOUSEHOLD_INVITATIONS_QUERY, {
    context: { headers },
  });

  useSubscription(HOUSEHOLD_MEMBER_CHANGED_SUBSCRIPTION, {
    variables: { householdId },
    onData({ data: subData }) {
      if (!subData.data) return;
      const changed = subData.data.householdMemberChanged;
      setMembers((prev) => {
        const exists = prev.some((m) => m.id === changed.id);
        if (exists) {
          return prev.map((m) => (m.id === changed.id ? changed : m));
        }
        return [...prev, changed];
      });
    },
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

  const invitations = invitationsData?.householdInvitations ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membres</CardTitle>
        {isOwnerOrAdmin && (
          <Button asChild size="sm" variant="outline">
            <Link href="/household/members/create">
              <Plus className="mr-1 size-4" />
              Ajouter
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {members.map((member) => {
            const name = member.displayName ?? member.userName ?? member.userEmail ?? 'Membre';
            const isCurrentUser = member.userId != null && member.userId === currentUserId;
            const memberInvitation = !member.userId
              ? getLatestInvitationForMember(member.id, invitations)
              : undefined;

            return (
              <li key={member.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MemberAvatar name={name} color={member.color} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <MemberNameEditor
                        member={member}
                        householdId={householdId}
                        onMemberUpdated={handleMemberUpdated}
                        canEdit={isOwnerOrAdmin || isCurrentUser}
                      />
                      {isCurrentUser && (
                        <span className="text-muted-foreground text-xs italic">(vous)</span>
                      )}
                      {!member.userId && !isCurrentUser && (
                        <span className="text-muted-foreground text-xs italic">(sans compte)</span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {ROLE_LABELS[member.role] ?? member.role}
                      {member.relation &&
                        ` · ${RELATION_LABELS[member.relation] ?? member.relation}`}
                    </span>
                  </div>
                </div>
                {!member.userId && isOwnerOrAdmin && (
                  <MemberInvitationActions
                    member={member}
                    invitation={memberInvitation}
                    householdId={householdId}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
