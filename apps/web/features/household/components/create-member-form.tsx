'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { HouseholdRole, createMemberProfileInput } from '@family-hub/shared';
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
import { CREATE_MEMBER_PROFILE_MUTATION, MY_HOUSEHOLD_QUERY } from '../graphql';
import { ROLE_LABELS, RELATION_LABELS, ROLE_ALLOWED_RELATIONS } from '../constants';

const ASSIGNABLE_ROLES = [
  HouseholdRole.ADMIN,
  HouseholdRole.ADULT,
  HouseholdRole.CHILD,
  HouseholdRole.PROVIDER,
] as const;

interface CreateMemberFormProps {
  householdId: string;
  onCreated?: () => void;
  redirectOnCreated?: boolean;
}

export function CreateMemberForm({
  householdId,
  onCreated,
  redirectOnCreated,
}: CreateMemberFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [relation, setRelation] = useState('');
  const [error, setError] = useState('');

  const headers = { 'x-household-id': householdId };

  const [createMember, { loading }] = useMutation(CREATE_MEMBER_PROFILE_MUTATION, {
    context: { headers },
    refetchQueries: [{ query: MY_HOUSEHOLD_QUERY }],
    onCompleted() {
      setDisplayName('');
      setRole('');
      setRelation('');
      setError('');
      onCreated?.();
      if (redirectOnCreated) {
        router.push('/household');
      }
    },
    onError(err) {
      const msg = err.message;
      if (msg.includes('limit') || msg.includes('maximum')) {
        setError('Nombre maximum de membres atteint.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
  });

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const input = { displayName: displayName.trim(), role, relation };
    const result = createMemberProfileInput.safeParse(input);
    if (!result.success) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    await createMember({ variables: { input: result.data } });
  }

  const allowedRelations = ROLE_ALLOWED_RELATIONS[role] ?? [];

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="member-name">Nom</Label>
        <Input
          id="member-name"
          type="text"
          placeholder="Ex : Paul"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
          maxLength={100}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="member-role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value);
            const allowed = ROLE_ALLOWED_RELATIONS[value] ?? [];
            if (!allowed.includes(relation)) {
              setRelation('');
            }
          }}
        >
          <SelectTrigger id="member-role" className="w-full">
            <SelectValue placeholder="Choisir un role" />
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
        <Label htmlFor="member-relation">Relation</Label>
        <Select value={relation} onValueChange={setRelation} disabled={!role}>
          <SelectTrigger id="member-relation" className="w-full">
            <SelectValue
              placeholder={role ? 'Choisir une relation' : 'Choisir d\u2019abord un r\u00f4le'}
            />
          </SelectTrigger>
          <SelectContent>
            {allowedRelations.map((r) => (
              <SelectItem key={r} value={r}>
                {RELATION_LABELS[r] ?? r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={loading || !displayName.trim() || !role || !relation}
      >
        {loading ? 'Création en cours…' : 'Ajouter le membre'}
      </Button>
    </form>
  );
}
