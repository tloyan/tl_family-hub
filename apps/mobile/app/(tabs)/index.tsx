import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';
import { HouseholdNameEditor } from '@/features/household/components/household-name-editor';
import { MembersList } from '@/features/household/components/members-list';
import { DangerZone } from '@/features/household/components/danger-zone';

export default function HouseholdScreen() {
  const router = useRouter();
  const { data, loading, error } = useQuery(MY_HOUSEHOLD_QUERY);

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/sign-in');
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-destructive">
          Une erreur est survenue. Veuillez reessayer.
        </Text>
      </View>
    );
  }

  if (!data?.myHousehold) {
    router.replace('/household/create');
    return null;
  }

  const { myHousehold } = data;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 px-6 py-6">
      <HouseholdNameEditor name={myHousehold.name} />

      <View className="gap-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {myHousehold.membersCount} {myHousehold.membersCount > 1 ? 'membres' : 'membre'}
        </Text>
        <MembersList members={myHousehold.members} />
      </View>

      <DangerZone />

      <Button variant="outline" onPress={() => void handleSignOut()}>
        <Text>Se deconnecter</Text>
      </Button>
    </ScrollView>
  );
}
