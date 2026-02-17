import { Text, View } from 'react-native';

export default function CalendarScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Calendar</Text>
      <Text className="mt-2 text-muted-foreground">Family calendar coming soon</Text>
    </View>
  );
}
