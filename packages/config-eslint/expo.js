import baseConfig from "./base.js";

export default [
  ...baseConfig,
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "check-file/filename-naming-convention": "off",
    },
  },
];
