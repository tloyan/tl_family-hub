import baseConfig from './base.js';

export default [
  ...baseConfig,
  { ignores: ['test/**', 'codegen.ts'] },
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
