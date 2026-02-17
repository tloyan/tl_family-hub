import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function CreateEventModal() {
  return (
    <>
      <Stack.Screen options={{ title: 'Create Event' }} />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-2xl font-bold text-foreground">Create Event</Text>
        <Text className="mt-2 text-muted-foreground">Event creation coming soon</Text>
      </View>
    </>
  );
}
