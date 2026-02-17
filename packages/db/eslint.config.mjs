import libraryConfig from "@family-hub/config-eslint/library";

export default [
  ...libraryConfig,
  { ignores: ["src/generated/**", "tsdown.config.ts", "prisma.config.ts", "prisma/**"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
