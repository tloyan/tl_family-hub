import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { signIn, emailOtp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Separator } from '@/components/ui/separator';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const isLoading = googleLoading || emailLoading;

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      await signIn.social({ provider: 'google', callbackURL: '/' });
    } catch {
      setError('Une erreur est survenue avec Google. Veuillez reessayer.');
      setGoogleLoading(false);
    }
  }

  async function handleEmailSubmit() {
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    setEmailLoading(true);
    try {
      const { error: otpError } = await emailOtp.sendVerificationOtp({
        email: trimmedEmail,
        type: 'sign-in',
      });

      if (otpError) {
        setError(otpError.message ?? "Impossible d'envoyer le code. Veuillez reessayer.");
        return;
      }
    } catch {
      setError("Impossible d'envoyer le code. Veuillez reessayer.");
      return;
    } finally {
      setEmailLoading(false);
    }

    router.push({
      pathname: '/(auth)/verify-otp',
      params: { email: trimmedEmail },
    });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-center text-2xl font-bold">Se connecter</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Connectez-vous pour acceder a votre espace famille
            </Text>
          </View>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onPress={() => void handleGoogleSignIn()}
            disabled={isLoading}
            accessibilityLabel="Se connecter avec Google"
          >
            {googleLoading ? (
              <Text>Connexion en cours...</Text>
            ) : (
              <>
                <Svg viewBox="0 0 24 24" width={20} height={20} accessibilityElementsHidden>
                  <Path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <Path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <Path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <Path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </Svg>
                <Text>Continuer avec Google</Text>
              </>
            )}
          </Button>

          <View className="flex-row items-center gap-4">
            <Separator className="flex-1" />
            <Text className="text-xs uppercase text-muted-foreground">ou par email</Text>
            <Separator className="flex-1" />
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Adresse email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                variant={error ? 'error' : 'default'}
                editable={!isLoading}
                accessibilityLabel="Adresse email"
              />
            </View>

            {error ? (
              <Text className="text-sm text-destructive" accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Button
              size="lg"
              className="w-full"
              onPress={() => void handleEmailSubmit()}
              disabled={isLoading}
            >
              <Text>{emailLoading ? 'Envoi en cours...' : 'Recevoir un code'}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
