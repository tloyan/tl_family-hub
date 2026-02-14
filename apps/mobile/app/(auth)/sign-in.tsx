import { Text, View } from "react-native";

export default function SignInScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Sign In</Text>
      <Text className="mt-2 text-muted-foreground">
        Authentication coming soon
      </Text>
    </View>
  );
}
