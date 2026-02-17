import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: add auth check — redirect to (auth)/sign-in if not authenticated
  return <Redirect href="/(tabs)" />;
}
