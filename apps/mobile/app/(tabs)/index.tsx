import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="items-center gap-8 px-6 py-12"
    >
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold tracking-tight">Family Hub</Text>
        <Text className="text-muted-foreground">Mobile app is running.</Text>
        <Button variant="destructive" onPress={() => void handleSignOut()}>
          <Text>Se deconnecter</Text>
        </Button>
      </View>

      {/* Button variants */}
      <View className="w-full items-center gap-4">
        <Text className="text-lg font-semibold">Buttons</Text>
        <View className="w-full gap-3">
          <Button>
            <Text>Default</Text>
          </Button>
          <Button variant="secondary">
            <Text>Secondary</Text>
          </Button>
          <Button variant="outline">
            <Text>Outline</Text>
          </Button>
          <Button variant="destructive">
            <Text>Destructive</Text>
          </Button>
          <Button variant="ghost">
            <Text>Ghost</Text>
          </Button>
        </View>
      </View>

      {/* FH Token colors — member palette */}
      <View className="w-full items-center gap-4">
        <Text className="text-lg font-semibold">Member Colors</Text>
        <View className="flex-row gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-1">
            <Text className="text-sm font-bold text-white">1</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-2">
            <Text className="text-sm font-bold text-white">2</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-3">
            <Text className="text-sm font-bold text-white">3</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-4">
            <Text className="text-sm font-bold text-white">4</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-5">
            <Text className="text-sm font-bold text-white">5</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-fh-member-6">
            <Text className="text-sm font-bold text-white">6</Text>
          </View>
        </View>
      </View>

      {/* FH Token colors — semantic */}
      <View className="w-full items-center gap-4">
        <Text className="text-lg font-semibold">Semantic Colors</Text>
        <View className="flex-row flex-wrap justify-center gap-3">
          <View className="rounded-md bg-fh-success px-3 py-1">
            <Text className="text-sm font-medium text-white">Success</Text>
          </View>
          <View className="rounded-md bg-fh-warning px-3 py-1">
            <Text className="text-sm font-medium text-white">Warning</Text>
          </View>
          <View className="rounded-md bg-fh-error px-3 py-1">
            <Text className="text-sm font-medium text-white">Error</Text>
          </View>
          <View className="rounded-md bg-fh-info px-3 py-1">
            <Text className="text-sm font-medium text-white">Info</Text>
          </View>
        </View>
      </View>

      {/* FH Token colors — moments */}
      <View className="w-full items-center gap-4">
        <Text className="text-lg font-semibold">Moment Backgrounds</Text>
        <View className="flex-row flex-wrap justify-center gap-3">
          <View className="h-16 w-20 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-morning">
            <Text className="text-xs font-medium">Morning</Text>
          </View>
          <View className="h-16 w-20 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-midday">
            <Text className="text-xs font-medium">Midday</Text>
          </View>
          <View className="h-16 w-20 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-evening">
            <Text className="text-xs font-medium">Evening</Text>
          </View>
          <View className="h-16 w-20 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-night">
            <Text className="text-xs font-medium text-white">Night</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
