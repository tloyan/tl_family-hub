import nextjsConfig from "@family-hub/config-eslint/nextjs";

export default [
  ...nextjsConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
