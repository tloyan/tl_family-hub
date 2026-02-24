import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useSession } from '@/lib/auth-client';

export default function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
