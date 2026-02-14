import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Home</Text>
      <Text className="mt-2 text-muted-foreground">
        Welcome to Family Hub
      </Text>
    </View>
  );
}
