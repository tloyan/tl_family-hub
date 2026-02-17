import { Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Settings</Text>
      <Text className="mt-2 text-muted-foreground">App settings coming soon</Text>
    </View>
  );
}
