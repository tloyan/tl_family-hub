'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy } from 'lucide-react';
import { ShareButton } from './share-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CREATE_INVITATION_MUTATION,
  HOUSEHOLD_INVITATIONS_QUERY,
  type HouseholdMember,
} from '../graphql';

interface InviteMemberDialogProps {
  member: HouseholdMember;
  householdId: string;
  children: React.ReactNode;
}

export function InviteMemberDialog({ member, householdId, children }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const headers = { 'x-household-id': householdId };

  const [createInvitation, { loading }] = useMutation(CREATE_INVITATION_MUTATION, {
    context: { headers },
    refetchQueries: [{ query: HOUSEHOLD_INVITATIONS_QUERY, context: { headers } }],
    onCompleted(data) {
      const link = `${window.location.origin}/invite/${data.createInvitation.token}`;
      setInviteLink(link);
    },
    onError(err) {
      const msg = err.message;
      if (
        msg.includes('linkedMemberProfileId') ||
        msg.includes('unique') ||
        msg.includes('already')
      ) {
        setError('Une invitation existe deja pour ce membre.');
      } else if (msg.includes('maximum') || msg.includes('limit')) {
        setError('Nombre maximum d\u2019invitations en attente atteint.');
      } else {
        setError('Une erreur est survenue. Veuillez reessayer.');
      }
    },
  });

  async function handleSubmit() {
    setError('');
    await createInvitation({
      variables: {
        input: {
          role: member.role,
          relation: member.relation ?? 'OTHER',
          ...(email.trim() ? { email: email.trim() } : {}),
          linkedMemberProfileId: member.id,
        },
      },
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail('');
      setError('');
      setInviteLink('');
      setCopied(false);
    }
  }

  const name = member.displayName ?? 'ce membre';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {inviteLink ? (
          <>
            <DialogHeader>
              <DialogTitle>Invitation creee</DialogTitle>
              <DialogDescription>
                Partagez ce lien ou scannez le QR code pour inviter {name}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <QRCodeSVG value={inviteLink} size={180} />
              <div className="flex w-full items-center gap-2">
                <Input value={inviteLink} readOnly className="text-xs" />
                <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <ShareButton url={inviteLink} />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Inviter {name}</DialogTitle>
              <DialogDescription>
                Une invitation sera creee avec le role et la relation de ce membre.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="invite-email">
                  Email <span className="text-muted-foreground text-xs">(optionnel)</span>
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="membre@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  disabled={loading}
                />
              </div>
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  handleOpenChange(false);
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={loading}>
                {loading ? 'Creation en cours…' : 'Creer l\u2019invitation'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
