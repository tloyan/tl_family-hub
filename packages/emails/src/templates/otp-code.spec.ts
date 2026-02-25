import { describe, it, expect } from 'vitest';
import { renderOtpEmail, type OtpType } from './otp-code';

describe('renderOtpEmail', () => {
  const otpTypes: OtpType[] = ['sign-in', 'email-verification', 'forget-password'];

  it.each(otpTypes)('returns correct subject for type "%s"', (type) => {
    const { subject } = renderOtpEmail({ otp: '123456', type });
    expect(subject).toBeDefined();
    expect(subject.length).toBeGreaterThan(0);
  });

  it('returns sign-in subject in French', () => {
    const { subject } = renderOtpEmail({ otp: '123456', type: 'sign-in' });
    expect(subject).toBe('Votre code de connexion Family Hub');
  });

  it('returns email-verification subject', () => {
    const { subject } = renderOtpEmail({ otp: '123456', type: 'email-verification' });
    expect(subject).toContain('Vérifiez votre adresse email');
  });

  it('returns forget-password subject', () => {
    const { subject } = renderOtpEmail({ otp: '123456', type: 'forget-password' });
    expect(subject).toContain('Réinitialisez votre mot de passe');
  });

  it('includes the OTP code in HTML', () => {
    const { html } = renderOtpEmail({ otp: '987654', type: 'sign-in' });
    expect(html).toContain('987654');
  });

  it.each([
    ['sign-in', 'Code de connexion'],
    ['email-verification', "Vérification d'email"],
    ['forget-password', 'Réinitialisation du mot de passe'],
  ] as const)('includes correct title for type "%s"', (type, expectedTitle) => {
    const { html } = renderOtpEmail({ otp: '123456', type });
    expect(html).toContain(expectedTitle);
  });

  it('produces valid HTML structure', () => {
    const { html } = renderOtpEmail({ otp: '123456', type: 'sign-in' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<body');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });
});
