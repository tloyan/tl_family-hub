import StyleDictionary from "style-dictionary";

const BASE_SOURCE = [
  "tokens/color/neutral.tokens.json",
  "tokens/color/member.tokens.json",
  "tokens/color/semantic.tokens.json",
  "tokens/color/moment.tokens.json",
  "tokens/spacing.tokens.json",
  "tokens/radius.tokens.json",
  "tokens/typography.tokens.json",
];

/** Get resolved token value (DTCG uses $value) */
function val(token) {
  return token.$value ?? token.value;
}

// ---------------------------------------------------------------------------
// Custom format: tailwind/preset
// Produces a CJS Tailwind v3 preset with colors, spacing, borderRadius,
// fontSize, fontWeight, lineHeight, fontFamily.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
  name: "tailwind/preset",
  format: ({ dictionary }) => {
    const colors = {};
    const spacing = {};
    const borderRadius = {};
    const fontSize = {};
    const fontWeight = {};
    const lineHeight = {};
    const fontFamily = {};

    for (const token of dictionary.allTokens) {
      const name = token.name;
      const v = val(token);

      if (token.$type === "color") {
        colors[`fh-${name}`] = v;
      } else if (name.startsWith("spacing-")) {
        spacing[name.replace("spacing-", "")] = v;
      } else if (name.startsWith("radius-")) {
        borderRadius[name.replace("radius-", "")] = v;
      } else if (name.startsWith("font-size-")) {
        fontSize[name.replace("font-size-", "")] = v;
      } else if (name.startsWith("font-weight-")) {
        fontWeight[name.replace("font-weight-", "")] = String(v);
      } else if (name.startsWith("line-height-")) {
        lineHeight[name.replace("line-height-", "")] = String(v);
      } else if (name.startsWith("font-family-")) {
        const fv = Array.isArray(v) ? v : String(v).split(", ");
        fontFamily[name.replace("font-family-", "")] = fv;
      }
    }

    const preset = {
      theme: {
        extend: {
          colors,
          spacing,
          borderRadius,
          fontSize,
          fontWeight,
          lineHeight,
          fontFamily,
        },
      },
    };

    return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(preset, null, 2)};\n`;
  },
});

// ---------------------------------------------------------------------------
// Custom format: typescript/constants
// Produces grouped `export const ... = { ... } as const` blocks.
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
  name: "typescript/constants",
  format: ({ dictionary }) => {
    const colors = { neutral: {}, member: {}, semantic: {}, moment: {} };
    const spacing = {};
    const radius = {};
    const fontFamily = {};
    const fontSize = {};
    const fontWeight = {};
    const lineHeight = {};

    for (const token of dictionary.allTokens) {
      const name = token.name;
      const v = val(token);

      if (token.$type === "color") {
        if (name.startsWith("bg-") || name.startsWith("text-") || name.startsWith("border-")) {
          colors.neutral[toCamelCase(name)] = v;
        } else if (name.startsWith("member-")) {
          colors.member[name.replace("member-", "")] = v;
        } else if (name.startsWith("moment-")) {
          colors.moment[name.replace("moment-", "")] = v;
        } else {
          colors.semantic[name] = v;
        }
      } else if (name.startsWith("spacing-")) {
        spacing[name.replace("spacing-", "")] = v;
      } else if (name.startsWith("radius-")) {
        radius[name.replace("radius-", "")] = v;
      } else if (name.startsWith("font-family-")) {
        fontFamily[name.replace("font-family-", "")] = v;
      } else if (name.startsWith("font-size-")) {
        fontSize[name.replace("font-size-", "")] = v;
      } else if (name.startsWith("font-weight-")) {
        fontWeight[name.replace("font-weight-", "")] = v;
      } else if (name.startsWith("line-height-")) {
        lineHeight[name.replace("line-height-", "")] = v;
      }
    }

    const lines = [];
    lines.push(`export const COLORS = ${JSON.stringify(colors, null, 2)} as const;\n`);
    lines.push(`export type MemberSlot = keyof typeof COLORS.member;\n`);
    lines.push(`export type SemanticColor = keyof typeof COLORS.semantic;\n`);
    lines.push(`export const SPACING = ${JSON.stringify(spacing, null, 2)} as const;\n`);
    lines.push(`export type SpacingScale = keyof typeof SPACING;\n`);
    lines.push(`export const RADIUS = ${JSON.stringify(radius, null, 2)} as const;\n`);
    lines.push(`export type RadiusScale = keyof typeof RADIUS;\n`);
    lines.push(`export const FONT_FAMILY = ${JSON.stringify(fontFamily, null, 2)} as const;\n`);
    lines.push(`export const FONT_SIZE = ${JSON.stringify(fontSize, null, 2)} as const;\n`);
    lines.push(`export type TypographyScale = keyof typeof FONT_SIZE;\n`);
    lines.push(`export const FONT_WEIGHT = ${JSON.stringify(fontWeight, null, 2)} as const;\n`);
    lines.push(`export const LINE_HEIGHT = ${JSON.stringify(lineHeight, null, 2)} as const;\n`);

    return lines.join("\n");
  },
});

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Builds
// ---------------------------------------------------------------------------
async function build() {
  // 1. CSS light — all base tokens → :root
  const sdLight = new StyleDictionary({
    source: BASE_SOURCE,
    platforms: {
      "css-light": {
        transformGroup: "css",
        prefix: "fh",
        buildPath: "dist/css/",
        files: [
          {
            destination: "variables.css",
            format: "css/variables",
            options: { showFileHeader: false },
          },
        ],
      },
    },
  });

  // 2. CSS dark — include base for resolution, source dark overrides, filter dark only
  const sdDark = new StyleDictionary({
    include: BASE_SOURCE,
    source: ["tokens/color/neutral.dark.tokens.json"],
    platforms: {
      "css-dark": {
        transformGroup: "css",
        prefix: "fh",
        buildPath: "dist/css/",
        files: [
          {
            destination: "variables.dark.css",
            format: "css/variables",
            filter: (token) => token.filePath.includes(".dark.tokens.json"),
            options: {
              selector: ".dark",
              showFileHeader: false,
            },
          },
        ],
      },
    },
  });

  // Minimal transforms: kebab names + color formatting, NO size/rem conversion
  const JS_TRANSFORMS = ["attribute/cti", "name/kebab", "color/css"];

  // 3. Tailwind preset — CJS module.exports (raw px values)
  const sdTailwind = new StyleDictionary({
    source: BASE_SOURCE,
    platforms: {
      "tailwind-preset": {
        transforms: JS_TRANSFORMS,
        buildPath: "dist/tailwind/",
        files: [
          {
            destination: "preset.js",
            format: "tailwind/preset",
          },
        ],
      },
    },
  });

  // 4. TypeScript constants (raw values)
  const sdTs = new StyleDictionary({
    source: BASE_SOURCE,
    platforms: {
      typescript: {
        transforms: JS_TRANSFORMS,
        buildPath: "dist/ts/",
        files: [
          {
            destination: "tokens.ts",
            format: "typescript/constants",
          },
        ],
      },
    },
  });

  await Promise.all([
    sdLight.buildAllPlatforms(),
    sdDark.buildAllPlatforms(),
    sdTailwind.buildAllPlatforms(),
    sdTs.buildAllPlatforms(),
  ]);

  console.log("✅ Style Dictionary build complete");
}

build();
