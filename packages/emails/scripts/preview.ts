import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { renderOtpEmail, type OtpType } from '../src/index.js';

const PREVIEW_DIR = join(import.meta.dirname, '..', '.preview');
mkdirSync(PREVIEW_DIR, { recursive: true });

const types: OtpType[] = ['sign-in', 'email-verification', 'forget-password'];

for (const type of types) {
  const { html, subject } = renderOtpEmail({ otp: '847291', type });
  const filePath = join(PREVIEW_DIR, `${type}.html`);
  writeFileSync(filePath, html);
  console.log(`  ${type} → ${filePath}  (${subject})`);
}

const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><title>Email Previews</title></head>
<body style="font-family:system-ui;padding:2rem;">
  <h1>Email Previews</h1>
  <ul>
    ${types.map((t) => `<li><a href="${t}.html">${t}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`;

const indexPath = join(PREVIEW_DIR, 'index.html');
writeFileSync(indexPath, indexHtml);

execSync(`open ${indexPath}`);
console.log('\nOpened preview in browser.');
