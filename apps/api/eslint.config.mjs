import nestjsConfig from "@family-hub/config-eslint/nestjs";

export default [
  ...nestjsConfig,
  { ignores: ["vitest.config.ts"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
