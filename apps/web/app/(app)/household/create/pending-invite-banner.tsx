'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PendingInviteBanner() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('pendingInviteToken'));
  }, []);

  if (!token) return null;

  function dismiss() {
    localStorage.removeItem('pendingInviteToken');
    setToken(null);
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-4">
        <p className="text-sm font-medium">Vous avez été invité(e) à rejoindre un foyer</p>
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/invite/${token}`}>Voir l&apos;invitation</Link>
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Ignorer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
