import { describe, it, expect } from 'vitest';
import { renderInvitationEmail } from './invitation';

const defaultParams = {
  inviterName: 'Alice',
  householdName: 'Famille Dupont',
  relation: 'Conjoint(e)',
  invitationLink: 'https://app.familyhub.test/invite/abc123',
};

describe('renderInvitationEmail', () => {
  it('returns a subject containing the household name', () => {
    const { subject } = renderInvitationEmail(defaultParams);
    expect(subject).toContain('Famille Dupont');
  });

  it('returns a subject containing the inviter name', () => {
    const { subject } = renderInvitationEmail(defaultParams);
    expect(subject).toContain('Alice');
  });

  it('returns a defined, non-empty subject', () => {
    const { subject } = renderInvitationEmail(defaultParams);
    expect(subject).toBeDefined();
    expect(subject.length).toBeGreaterThan(0);
  });

  it('includes inviterName in HTML', () => {
    const { html } = renderInvitationEmail(defaultParams);
    expect(html).toContain('Alice');
  });

  it('includes householdName in HTML', () => {
    const { html } = renderInvitationEmail(defaultParams);
    expect(html).toContain('Famille Dupont');
  });

  it('includes relation in HTML', () => {
    const { html } = renderInvitationEmail(defaultParams);
    expect(html).toContain('Conjoint(e)');
  });

  it('includes invitationLink in HTML', () => {
    const { html } = renderInvitationEmail(defaultParams);
    expect(html).toContain('https://app.familyhub.test/invite/abc123');
  });

  it('produces valid HTML structure', () => {
    const { html } = renderInvitationEmail(defaultParams);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<body');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });
});
