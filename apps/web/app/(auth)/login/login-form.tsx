'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, emailOtp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function LoginForm() {
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
      setError('Une erreur est survenue avec Google. Veuillez réessayer.');
      setGoogleLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
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
        setError(otpError.message ?? 'Impossible d\u2019envoyer le code. Veuillez réessayer.');
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`);
    } catch {
      setError('Impossible d\u2019envoyer le code. Veuillez réessayer.');
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={() => void handleGoogleSignIn()}
        disabled={isLoading}
        aria-label="Se connecter avec Google"
      >
        {googleLoading ? (
          'Connexion en cours…'
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </>
        )}
      </Button>

      <div className="relative flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase">ou par email</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={(e) => void handleEmailSubmit(e)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            autoComplete="email"
            aria-describedby={error ? 'login-error' : undefined}
            aria-invalid={!!error}
            disabled={isLoading}
          />
        </div>

        {error && (
          <p id="login-error" role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {emailLoading ? 'Envoi en cours…' : 'Recevoir un code'}
        </Button>
      </form>
    </div>
  );
}
