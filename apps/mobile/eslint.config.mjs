import expoConfig from "@family-hub/config-eslint/expo";

export default [
  ...expoConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
