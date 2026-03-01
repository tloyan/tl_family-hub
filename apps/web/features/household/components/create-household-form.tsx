'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { createHouseholdInput } from '@family-hub/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREATE_HOUSEHOLD_MUTATION } from '../graphql';

export function CreateHouseholdForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createHousehold, { loading }] = useMutation(CREATE_HOUSEHOLD_MUTATION, {
    onCompleted() {
      router.replace('/household');
    },
    onError(err) {
      const message = err.message;
      if (message.includes('409') || message.toLowerCase().includes('already')) {
        setError('Vous avez déjà un foyer.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
  });

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const result = createHouseholdInput.safeParse({ name: trimmedName });

    if (!result.success) {
      setError('Le nom du foyer doit contenir entre 1 et 100 caractères.');
      return;
    }

    await createHousehold({
      variables: { input: { name: result.data.name } },
    });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="household-name">Nom du foyer</Label>
        <Input
          id="household-name"
          type="text"
          placeholder="Ex : Famille Dupont"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          maxLength={100}
          aria-describedby={error ? 'household-error' : undefined}
          aria-invalid={!!error}
          disabled={loading}
        />
      </div>

      {error && (
        <p id="household-error" role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? 'Création en cours…' : 'Créer le foyer'}
      </Button>
    </form>
  );
}
