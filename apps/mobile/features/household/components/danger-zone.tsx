import { Alert, View } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { DELETE_HOUSEHOLD_MUTATION } from '../graphql';

export function DangerZone() {
  const router = useRouter();

  const [deleteHousehold, { loading }] = useMutation(DELETE_HOUSEHOLD_MUTATION, {
    update(cache) {
      cache.evict({ fieldName: 'myHousehold' });
      cache.gc();
    },
    onCompleted() {
      router.replace('/household/create');
    },
  });

  function handleDelete() {
    Alert.alert(
      'Supprimer le foyer',
      'Cette action est irreversible. Toutes les donnees du foyer seront supprimees.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => void deleteHousehold(),
        },
      ],
    );
  }

  return (
    <View className="rounded-lg border border-destructive/50 p-4 gap-3">
      <Text className="text-base font-semibold text-destructive">Zone de danger</Text>
      <Text className="text-sm text-muted-foreground">
        Supprimer definitivement le foyer et toutes ses donnees.
      </Text>
      <Button variant="destructive" onPress={handleDelete} disabled={loading}>
        <Text>Supprimer le foyer</Text>
      </Button>
    </View>
  );
}
