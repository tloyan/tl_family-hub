'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, emailOtp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Link from 'next/link';

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [resending, setResending] = useState(false);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

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
          setError(signInError.message ?? 'Code invalide. Veuillez réessayer.');
          setOtp('');
          return;
        }

        router.replace('/');
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer.');
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
      setError('Impossible de renvoyer le code. Veuillez réessayer.');
    } finally {
      setResending(false);
    }
  }

  if (!email) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Vérification</h1>
        <p className="text-muted-foreground text-sm">
          Saisissez le code à 6 chiffres envoyé à{' '}
          <span className="text-foreground font-medium">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          disabled={verifying}
          aria-label="Code de vérification"
          aria-describedby={error ? 'otp-error' : undefined}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        {error && (
          <p id="otp-error" role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <Button
          className="h-11 w-full"
          onClick={() => void handleVerify(otp)}
          disabled={otp.length !== OTP_LENGTH || verifying}
        >
          {verifying ? 'Vérification…' : 'Vérifier'}
        </Button>

        <div className="text-sm">
          {resendTimer > 0 ? (
            <p className="text-muted-foreground">Renvoyer le code dans {resendTimer}s</p>
          ) : (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {resending ? 'Envoi en cours…' : 'Renvoyer le code'}
            </button>
          )}
        </div>

        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          Utiliser une autre adresse email
        </Link>
      </div>
    </div>
  );
}
