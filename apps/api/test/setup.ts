process.env['RESEND_API_KEY'] ??= 're_test_dummy';
process.env['EMAIL_FROM'] ??= 'test@example.com';
process.env['BETTER_AUTH_SECRET'] ??= 'test-secret-that-is-at-least-32-characters-long';
process.env['BETTER_AUTH_URL'] ??= 'http://localhost:4000';
process.env['GOOGLE_CLIENT_ID'] ??= 'test-google-client-id';
process.env['GOOGLE_CLIENT_SECRET'] ??= 'test-google-client-secret';
process.env['DATABASE_URL'] ??= 'postgresql://postgres:postgres@localhost:5432/family_hub_test';
process.env['REDIS_URL'] ??= 'redis://localhost:6379';
