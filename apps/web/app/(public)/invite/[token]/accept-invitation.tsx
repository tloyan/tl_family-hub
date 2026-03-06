'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { useSession } from '@/lib/auth-client';
import { ApolloProvider } from '@/components/providers/apollo-provider';
import { Button } from '@/components/ui/button';
import { ACCEPT_INVITATION_MUTATION } from '@/features/household/graphql';

function AcceptInvitationInner({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [error, setError] = useState('');

  const [acceptInvitation, { loading }] = useMutation(ACCEPT_INVITATION_MUTATION, {
    onCompleted() {
      localStorage.removeItem('pendingInviteToken');
      router.replace('/household');
    },
    onError(err) {
      const msg = err.message;
      if (msg.includes('already') || msg.includes('member')) {
        setError('Vous êtes déjà membre de ce foyer.');
      } else if (msg.includes('household')) {
        setError('Vous appartenez déjà à un foyer.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
  });

  if (isPending) {
    return <p className="text-muted-foreground text-center text-sm">Chargement…</p>;
  }

  if (!session) {
    return (
      <Button
        className="h-11 w-full"
        onClick={() => {
          localStorage.setItem('pendingInviteToken', token);
          router.push(`/login?redirect=/invite/${token}`);
        }}
      >
        Se connecter pour rejoindre
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-destructive text-center text-sm">
          {error}
        </p>
      )}
      <Button
        className="h-11 w-full"
        disabled={loading}
        onClick={() => {
          void acceptInvitation({ variables: { input: { token } } });
        }}
      >
        {loading ? 'Acceptation en cours…' : 'Rejoindre le foyer'}
      </Button>
    </div>
  );
}

export function AcceptInvitationClient({ token }: { token: string }) {
  return (
    <ApolloProvider>
      <AcceptInvitationInner token={token} />
    </ApolloProvider>
  );
}
