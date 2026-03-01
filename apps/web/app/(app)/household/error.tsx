'use client';

import { Button } from '@/components/ui/button';

export default function HouseholdError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-16">
      <p className="text-destructive text-sm">
        Impossible de charger le foyer. Veuillez réessayer.
      </p>
      <Button variant="outline" size="sm" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
