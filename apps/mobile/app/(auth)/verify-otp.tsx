import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { signIn, emailOtp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { OtpInput, OTP_LENGTH } from '@/components/ui/otp-input';

const RESEND_DELAY = 60;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [resending, setResending] = useState(false);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [resendTimer]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!email || verifyingRef.current) return;
      verifyingRef.current = true;
      setError('');
      setVerifying(true);

      try {
        const { error: signInError } = await signIn.emailOtp({
          email,
          otp: code,
        });

        if (signInError) {
          setError(signInError.message ?? 'Code invalide. Veuillez reessayer.');
          setOtp('');
          return;
        }

        router.replace('/');
      } catch {
        setError('Une erreur est survenue. Veuillez reessayer.');
        setOtp('');
      } finally {
        setVerifying(false);
        verifyingRef.current = false;
      }
    },
    [email, router],
  );

  function handleOtpChange(value: string) {
    setOtp(value);
    if (value.length === OTP_LENGTH) {
      void handleVerify(value);
    }
  }

  async function handleResend() {
    if (!email || resendTimer > 0) return;
    setError('');
    setResending(true);

    try {
      const { error: resendError } = await emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });

      if (resendError) {
        setError(resendError.message ?? 'Impossible de renvoyer le code.');
        return;
      }

      setResendTimer(RESEND_DELAY);
      setOtp('');
    } catch {
      setError('Impossible de renvoyer le code. Veuillez reessayer.');
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return <Redirect href="/(auth)/sign-in" />;
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
            <Text className="text-center text-2xl font-bold">Verification</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Saisissez le code a 6 chiffres envoye a{' '}
              <Text className="text-sm font-medium text-foreground">{email}</Text>
            </Text>
            <Text className="text-center text-xs text-muted-foreground">
              Le code expire dans 10 minutes
            </Text>
          </View>

          <View className="items-center gap-4">
            <OtpInput
              value={otp}
              onChangeText={handleOtpChange}
              hasError={!!error}
              disabled={verifying}
            />

            {error ? (
              <Text className="text-sm text-destructive" accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Button
              size="lg"
              className="w-full"
              onPress={() => void handleVerify(otp)}
              disabled={otp.length !== OTP_LENGTH || verifying}
            >
              <Text>{verifying ? 'Verification...' : 'Verifier'}</Text>
            </Button>

            <View className="items-center">
              {resendTimer > 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Renvoyer le code dans {resendTimer}s
                </Text>
              ) : (
                <Button variant="ghost" onPress={() => void handleResend()} disabled={resending}>
                  <Text>{resending ? 'Envoi en cours...' : 'Renvoyer le code'}</Text>
                </Button>
              )}
            </View>

            <Button
              variant="ghost"
              onPress={() => {
                router.back();
              }}
            >
              <Text className="text-sm text-muted-foreground underline">
                Utiliser une autre adresse email
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
