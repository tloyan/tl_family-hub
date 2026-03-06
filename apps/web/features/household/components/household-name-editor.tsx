'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { updateHouseholdInput } from '@family-hub/shared';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import { UPDATE_HOUSEHOLD_MUTATION, type HouseholdMember } from '../graphql';

interface HouseholdNameEditorProps {
  name: string;
  members: HouseholdMember[];
}

export function HouseholdNameEditor({ name, members }: HouseholdNameEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentMember = members.find((m) => m.userId === session?.user.id);
  const isOwner = currentMember?.role === 'OWNER';
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [updateHousehold, { loading: updating }] = useMutation(UPDATE_HOUSEHOLD_MUTATION);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

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
    const result = updateHouseholdInput.safeParse({ name: editName });
    if (!result.success) {
      setEditError('Le nom doit contenir entre 1 et 100 caractères.');
      return;
    }

    try {
      await updateHousehold({
        variables: { input: { name: result.data.name } },
      });
      setIsEditing(false);
      setEditError(null);
      router.refresh();
    } catch {
      setEditError('Seul le propriétaire peut renommer le foyer.');
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
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
            className="text-2xl font-bold h-auto py-1"
            disabled={updating}
            aria-label="Nom du foyer"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              void saveEdit();
            }}
            disabled={updating}
            aria-label="Enregistrer"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelEditing}
            disabled={updating}
            aria-label="Annuler"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {editError && (
          <p role="alert" className="text-destructive text-sm">
            {editError}
          </p>
        )}
      </div>
    );
  }

  if (!isOwner) {
    return <h1 className="text-2xl font-bold">{name}</h1>;
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{name}</h1>
      <Button variant="ghost" size="icon" onClick={startEditing} aria-label="Renommer le foyer">
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
