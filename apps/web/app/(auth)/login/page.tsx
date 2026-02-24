import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Connexion — Family Hub',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Se connecter</h1>
        <p className="text-muted-foreground text-sm">
          Connectez-vous pour accéder à votre espace famille
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
