'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { DELETE_HOUSEHOLD_MUTATION } from '../graphql';

interface DangerZoneProps {
  householdName: string;
}

export function DangerZone({ householdName }: DangerZoneProps) {
  const router = useRouter();
  const [deleteHousehold, { loading: deleting }] = useMutation(DELETE_HOUSEHOLD_MUTATION);

  async function handleDelete() {
    try {
      await deleteHousehold();
      router.replace('/household/create');
    } catch {
      // The AlertDialog will close; error is shown via a toast or ignored for MVP
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Zone de danger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Supprimer le foyer</p>
            <p className="text-muted-foreground text-xs">
              Cette action est irréversible. Toutes les données seront supprimées.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le foyer ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le foyer « {householdName} » et toutes ses données
                  (membres, cercles) seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void handleDelete();
                  }}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
