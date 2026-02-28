import type { Metadata } from 'next';
import { CreateHouseholdForm } from '@/features/household/components/create-household-form';

export const metadata: Metadata = {
  title: 'Créer un foyer — Family Hub',
};

export default function CreateHouseholdPage() {
  return (
    <div className="flex flex-col items-center pt-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold">Créer votre foyer</h1>
            <p className="text-muted-foreground text-sm">
              Donnez un nom à votre foyer pour commencer
            </p>
          </div>
          <CreateHouseholdForm />
        </div>
      </div>
    </div>
  );
}
