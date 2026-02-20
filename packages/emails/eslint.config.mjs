import libraryConfig from "@family-hub/config-eslint/library";

export default [
  ...libraryConfig,
  { ignores: ["tsdown.config.ts", "scripts/**"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
