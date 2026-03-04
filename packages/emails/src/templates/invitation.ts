export interface InvitationEmailParams {
  inviterName: string;
  householdName: string;
  relation: string;
  invitationLink: string;
}

interface RenderedEmail {
  html: string;
  subject: string;
}

export function renderInvitationEmail({
  inviterName,
  householdName,
  relation,
  invitationLink,
}: InvitationEmailParams): RenderedEmail {
  const subject = `${inviterName} vous invite à rejoindre ${householdName} — Family Hub`;
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Family Hub</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Invitation</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
                <strong>${inviterName}</strong> vous invite à rejoindre le foyer <strong>${householdName}</strong> en tant que <strong>${relation}</strong>.
              </p>
              <!-- CTA Button -->
              <div style="text-align:center;margin:0 0 32px;">
                <a href="${invitationLink}" style="display:inline-block;background-color:#18181b;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Accepter l'invitation</a>
              </div>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#a1a1aa;">
                Cette invitation expire dans 7 jours. Si vous n'êtes pas concerné(e), vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; Family Hub</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, subject };
}
