'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { HouseholdRole, createInvitationInput } from '@family-hub/shared';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Link as LinkIcon } from 'lucide-react';
import { ShareButton } from './share-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CREATE_INVITATION_MUTATION,
  CREATE_MEMBER_PROFILE_MUTATION,
  HOUSEHOLD_INVITATIONS_QUERY,
  MY_HOUSEHOLD_QUERY,
  type HouseholdMember,
} from '../graphql';
import { ROLE_LABELS, RELATION_LABELS, ROLE_ALLOWED_RELATIONS } from '../constants';

const ASSIGNABLE_ROLES = [
  HouseholdRole.ADMIN,
  HouseholdRole.ADULT,
  HouseholdRole.CHILD,
  HouseholdRole.PROVIDER,
] as const;

interface CreateInvitationFormProps {
  householdId: string;
  unlinkedMembers?: HouseholdMember[];
}

export function CreateInvitationForm({
  householdId,
  unlinkedMembers = [],
}: CreateInvitationFormProps) {
  const [linkedMemberId, setLinkedMemberId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const headers = { 'x-household-id': householdId };

  const [createMember, { loading: creatingMember }] = useMutation(CREATE_MEMBER_PROFILE_MUTATION, {
    context: { headers },
    refetchQueries: [{ query: MY_HOUSEHOLD_QUERY }],
  });

  const [createInvitation, { loading: creatingInvitation }] = useMutation(
    CREATE_INVITATION_MUTATION,
    {
      context: { headers },
      refetchQueries: [{ query: HOUSEHOLD_INVITATIONS_QUERY, context: { headers } }],
      onCompleted(data) {
        const link = `${window.location.origin}/invite/${data.createInvitation.token}`;
        setInviteLink(link);
      },
      onError(err) {
        const msg = err.message;
        if (msg.includes('maximum') || msg.includes('limit')) {
          setError('Nombre maximum d\u2019invitations en attente atteint.');
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      },
    },
  );

  const loading = creatingMember || creatingInvitation;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    let memberProfileId = linkedMemberId;

    // Create member profile first if displayName is provided and no linked member
    if (displayName.trim() && !linkedMemberId) {
      try {
        const memberResult = await createMember({
          variables: {
            input: { displayName: displayName.trim(), role, relation },
          },
        });
        memberProfileId = memberResult.data?.createMemberProfile.id ?? '';
      } catch {
        setError('Impossible de creer le profil membre.');
        return;
      }
    }

    const input = {
      role,
      relation,
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(memberProfileId ? { linkedMemberProfileId: memberProfileId } : {}),
    };

    const result = createInvitationInput.safeParse(input);
    if (!result.success) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    await createInvitation({ variables: { input: result.data } });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (inviteLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation créée</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <QRCodeSVG value={inviteLink} size={200} />
          <div className="flex w-full items-center gap-2">
            <Input value={inviteLink} readOnly className="text-xs" />
            <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Partagez ce lien ou scannez le QR code pour rejoindre le foyer.
          </p>
          <ShareButton url={inviteLink} />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setInviteLink('');
              setLinkedMemberId('');
              setDisplayName('');
              setRole('');
              setRelation('');
              setEmail('');
            }}
          >
            <LinkIcon className="mr-2 size-4" />
            Créer une autre invitation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      {unlinkedMembers.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="invitation-member">
            Lier à un membre existant{' '}
            <span className="text-muted-foreground text-xs">(optionnel)</span>
          </Label>
          <Select
            value={linkedMemberId}
            onValueChange={(value) => {
              const none = value === 'none';
              setLinkedMemberId(none ? '' : value);
              if (!none) {
                const member = unlinkedMembers.find((m) => m.id === value);
                if (member) {
                  setRole(member.role);
                  if (member.relation) {
                    setRelation(member.relation);
                  } else {
                    const allowed = ROLE_ALLOWED_RELATIONS[member.role] ?? [];
                    if (!allowed.includes(relation)) {
                      setRelation('');
                    }
                  }
                }
              }
            }}
          >
            <SelectTrigger id="invitation-member" className="w-full">
              <SelectValue placeholder="Aucun — nouvelle invitation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun — nouvelle invitation</SelectItem>
              {unlinkedMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.displayName ?? 'Membre'} ({ROLE_LABELS[m.role] ?? m.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!linkedMemberId && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="invitation-displayname">
            Nom <span className="text-muted-foreground text-xs">(optionnel)</span>
          </Label>
          <Input
            id="invitation-displayname"
            placeholder="Prenom ou surnom du membre"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
            disabled={loading}
          />
          <p className="text-muted-foreground text-xs">Un profil membre sera cree avec ce nom.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="invitation-role">Rôle</Label>
        <Select
          value={role}
          disabled={!!linkedMemberId}
          onValueChange={(value) => {
            setRole(value);
            const allowed = ROLE_ALLOWED_RELATIONS[value] ?? [];
            if (!allowed.includes(relation)) {
              setRelation('');
            }
          }}
        >
          <SelectTrigger id="invitation-role" className="w-full">
            <SelectValue placeholder="Choisir un rôle" />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invitation-relation">Relation</Label>
        <Select
          value={relation}
          onValueChange={setRelation}
          disabled={
            !role ||
            !!(linkedMemberId && unlinkedMembers.find((m) => m.id === linkedMemberId)?.relation)
          }
        >
          <SelectTrigger id="invitation-relation" className="w-full">
            <SelectValue
              placeholder={role ? 'Choisir une relation' : 'Choisir d\u2019abord un rôle'}
            />
          </SelectTrigger>
          <SelectContent>
            {(ROLE_ALLOWED_RELATIONS[role] ?? []).map((r) => (
              <SelectItem key={r} value={r}>
                {RELATION_LABELS[r] ?? r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invitation-email">
          Email <span className="text-muted-foreground text-xs">(optionnel)</span>
        </Label>
        <Input
          id="invitation-email"
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

      <Button type="submit" className="h-11 w-full" disabled={loading || !role || !relation}>
        {loading ? 'Création en cours…' : 'Créer l\u2019invitation'}
      </Button>
    </form>
  );
}
