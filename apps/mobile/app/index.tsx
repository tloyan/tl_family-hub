import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useQuery } from '@apollo/client/react';

import { useSession } from '@/lib/auth-client';
import { MY_HOUSEHOLD_QUERY } from '@/features/household/graphql';

export default function Index() {
  const { data: session, isPending } = useSession();
  const { data, loading } = useQuery(MY_HOUSEHOLD_QUERY, { skip: !session });

  if (isPending || (session && loading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!data?.myHousehold) {
    return <Redirect href="/household/create" />;
  }

  return <Redirect href="/(tabs)" />;
}
