import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyOtpForm } from './verify-otp-form';

export const metadata: Metadata = {
  title: 'Vérification — Family Hub',
};

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
