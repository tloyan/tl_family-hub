import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { createHouseholdInput } from '@family-hub/shared';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { CREATE_HOUSEHOLD_MUTATION, MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';

export default function HouseholdCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createHousehold, { loading }] = useMutation(CREATE_HOUSEHOLD_MUTATION, {
    refetchQueries: [MY_HOUSEHOLD_QUERY],
  });

  async function handleCreate() {
    setError('');

    const result = createHouseholdInput.safeParse({ name });
    if (!result.success) {
      setError('Le nom doit contenir entre 1 et 100 caracteres.');
      return;
    }

    try {
      await createHousehold({ variables: { input: { name: result.data.name } } });
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('409') || message.toLowerCase().includes('already')) {
        setError('Vous avez deja un foyer.');
      } else {
        setError('Une erreur est survenue. Veuillez reessayer.');
      }
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Creer un foyer', headerBackVisible: false }} />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-6">
            <View className="gap-2">
              <Text className="text-center text-2xl font-bold">Creer votre foyer</Text>
              <Text className="text-center text-sm text-muted-foreground">
                Donnez un nom a votre foyer pour commencer.
              </Text>
            </View>

            <View className="gap-4">
              <TextInput
                placeholder="Nom du foyer"
                value={name}
                onChangeText={setName}
                autoFocus
                variant={error ? 'error' : 'default'}
              />

              {error ? (
                <Text className="text-sm text-destructive" accessibilityRole="alert">
                  {error}
                </Text>
              ) : null}

              <Button
                size="lg"
                className="w-full"
                onPress={() => void handleCreate()}
                disabled={!name.trim() || loading}
              >
                <Text>{loading ? 'Creation...' : 'Creer le foyer'}</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
