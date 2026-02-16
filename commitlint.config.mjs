export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'ci', 'style'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'web',
        'mobile',
        'shared',
        'db',
        'auth',
        'ui',
        'ui-native',
        'tokens',
        'api-client',
        'config-eslint',
        'config-ts',
        'config-tailwind',
      ],
    ],
    'scope-empty': [0],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
  },
};
