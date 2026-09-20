import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const length = z.string().regex(/^(0|\d{1,3}(\.\d{1,3})?(px|rem))$/);
const safeName = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
export const colorsSchema = z
  .object({
    primary: hex,
    primaryForeground: hex,
    secondary: hex,
    secondaryForeground: hex,
    background: hex,
    foreground: hex,
    surface: hex,
    surfaceForeground: hex,
    muted: hex,
    mutedForeground: hex,
    border: hex,
    focus: hex,
    success: hex,
    successForeground: hex,
    warning: hex,
    warningForeground: hex,
    destructive: hex,
    destructiveForeground: hex,
  })
  .strict();
export const recipeSchema = z
  .object({
    radius: length.optional(),
    height: length.optional(),
    padding: length.optional(),
    fontSize: length.optional(),
    fontWeight: z.number().int().min(100).max(900).optional(),
    borderWidth: length.optional(),
    background: hex.optional(),
    foreground: hex.optional(),
    shadow: z.enum(["none", "subtle", "soft", "strong"]).optional(),
  })
  .strict();
export const designSystemSchema = z
  .object({
    schemaVersion: z.literal(1),
    name: z.string().trim().min(1).max(80),
    framework: z.enum(["react", "vue"]),
    mode: z.enum(["light", "dark"]),
    tokens: z
      .object({
        colors: colorsSchema,
        typography: z
          .object({
            fontFamily: z.enum(["inter", "system", "geist", "serif", "mono"]),
            headingFamily: z.enum([
              "inter",
              "system",
              "geist",
              "serif",
              "mono",
            ]),
            baseSize: z.number().min(12).max(20),
            scale: z.number().min(1.05).max(1.5),
            lineHeight: z.number().min(1.2).max(2),
            normalWeight: z.number().int().min(300).max(500),
            mediumWeight: z.number().int().min(500).max(700),
            boldWeight: z.number().int().min(600).max(900),
          })
          .strict(),
        spacing: z
          .object({
            unit: z.number().min(2).max(8),
            scale: z.number().min(0.5).max(2),
          })
          .strict(),
        sizing: z
          .object({
            controlHeight: z.number().min(28).max(64),
            container: z.number().min(640).max(1920),
          })
          .strict(),
        density: z.enum(["compact", "default", "comfortable"]),
        radius: z
          .object({ sm: length, md: length, lg: length, xl: length })
          .strict(),
        borders: z
          .object({
            width: z.number().min(0).max(4),
            style: z.enum(["solid", "dashed"]),
          })
          .strict(),
        shadows: z.enum(["none", "subtle", "soft", "strong"]),
        motion: z
          .object({
            duration: z.number().min(0).max(1000),
            easing: z.enum(["ease", "ease-in-out", "linear"]),
          })
          .strict(),
        breakpoints: z
          .object({
            sm: z.number().min(320).max(768),
            md: z.number().min(768).max(1024),
            lg: z.number().min(1024).max(1920),
          })
          .strict(),
        zIndex: z
          .object({
            dropdown: z.number().int().min(1).max(1000),
            overlay: z.number().int().min(1).max(1000),
            toast: z.number().int().min(1).max(1000),
          })
          .strict(),
      })
      .strict(),
    recipes: z.record(safeName, recipeSchema),
    overrides: z.record(safeName, recipeSchema),
  })
  .strict();
export type DesignSystem = z.infer<typeof designSystemSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type Framework = "react" | "vue" | "svelte" | "solid";
export const frameworks = [
  { id: "react", label: "React", available: true },
  { id: "vue", label: "Vue", available: true },
  { id: "svelte", label: "Svelte", available: false },
  { id: "solid", label: "SolidJS", available: false },
] as const;
export const fontFamilies = {
  inter: "Inter, ui-sans-serif, system-ui, sans-serif",
  system: "ui-sans-serif, system-ui, sans-serif",
  geist: "Geist, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, ui-serif, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
};
const lightColors: DesignSystem["tokens"]["colors"] = {
  primary: "#4355db",
  primaryForeground: "#ffffff",
  secondary: "#e9ecf4",
  secondaryForeground: "#283046",
  background: "#ffffff",
  foreground: "#1d2332",
  surface: "#ffffff",
  surfaceForeground: "#1d2332",
  muted: "#f3f4f7",
  mutedForeground: "#616779",
  border: "#dce0e9",
  focus: "#4355db",
  success: "#187348",
  successForeground: "#ffffff",
  warning: "#f6c65b",
  warningForeground: "#493308",
  destructive: "#c32d40",
  destructiveForeground: "#ffffff",
};
const darkColors: DesignSystem["tokens"]["colors"] = {
  primary: "#a4acff",
  primaryForeground: "#171b3d",
  secondary: "#303544",
  secondaryForeground: "#f0f1f6",
  background: "#13161e",
  foreground: "#f0f1f6",
  surface: "#1b1f2a",
  surfaceForeground: "#f0f1f6",
  muted: "#272c39",
  mutedForeground: "#a7afc3",
  border: "#444c60",
  focus: "#a4acff",
  success: "#76d5a5",
  successForeground: "#103723",
  warning: "#f6c65b",
  warningForeground: "#493308",
  destructive: "#ff8393",
  destructiveForeground: "#490c16",
};
export function createDesignSystem(
  name = "Untitled library",
  mode: "light" | "dark" = "light",
  framework: DesignSystem["framework"] = "react",
): DesignSystem {
  return designSystemSchema.parse({
    schemaVersion: 1,
    name,
    framework,
    mode,
    tokens: {
      colors: { ...(mode === "dark" ? darkColors : lightColors) },
      typography: {
        fontFamily: "system",
        headingFamily: "system",
        baseSize: 14,
        scale: 1.2,
        lineHeight: 1.5,
        normalWeight: 400,
        mediumWeight: 500,
        boldWeight: 650,
      },
      spacing: { unit: 4, scale: 1 },
      sizing: { controlHeight: 40, container: 1200 },
      density: "default",
      radius: { sm: "4px", md: "8px", lg: "12px", xl: "20px" },
      borders: { width: 1, style: "solid" },
      shadows: "subtle",
      motion: { duration: 160, easing: "ease" },
      breakpoints: { sm: 640, md: 768, lg: 1024 },
      zIndex: { dropdown: 60, overlay: 50, toast: 80 },
    },
    recipes: {},
    overrides: {},
  });
}
export function changeMode(
  system: DesignSystem,
  mode: "light" | "dark",
): DesignSystem {
  return designSystemSchema.parse({
    ...system,
    mode,
    tokens: {
      ...system.tokens,
      colors: mode === "dark" ? darkColors : lightColors,
    },
  });
}
const shadowValues = {
  none: "none",
  subtle: "0 1px 3px rgb(0 0 0 / 0.06)",
  soft: "0 8px 24px rgb(0 0 0 / 0.10)",
  strong: "0 16px 48px rgb(0 0 0 / 0.18)",
};
const kebab = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
export function resolveRecipe(
  system: DesignSystem,
  component: string,
  instance: Recipe = {},
): Recipe {
  const overlay = [
    "dialog",
    "alert-dialog",
    "drawer",
    "sheet",
    "popover",
    "dropdown",
    "context-menu",
    "hover-card",
    "toast",
  ].includes(component);
  return {
    ...{
      radius: overlay ? system.tokens.radius.lg : system.tokens.radius.md,
      height: `${system.tokens.sizing.controlHeight}px`,
      padding: `${system.tokens.spacing.unit * 3 * system.tokens.spacing.scale}px`,
      fontSize: `${system.tokens.typography.baseSize}px`,
      fontWeight: system.tokens.typography.mediumWeight,
      borderWidth: `${system.tokens.borders.width}px`,
      shadow: system.tokens.shadows,
    },
    ...system.recipes[component],
    ...system.overrides[component],
    ...recipeSchema.parse(instance),
  };
}
export function tokenVariables(input: DesignSystem): Record<string, string> {
  const system = designSystemSchema.parse(input),
    t = system.tokens;
  const values: Record<string, string> = {};
  for (const [name, value] of Object.entries(t.colors))
    values[`--cr-${kebab(name)}`] = value;
  for (const [name, value] of Object.entries(t.radius))
    values[`--cr-radius-${name}`] = value;
  Object.assign(values, {
    "--cr-font": fontFamilies[t.typography.fontFamily],
    "--cr-heading-font": fontFamilies[t.typography.headingFamily],
    "--cr-font-size": `${t.typography.baseSize}px`,
    "--cr-type-scale": String(t.typography.scale),
    "--cr-line-height": String(t.typography.lineHeight),
    "--cr-font-normal": String(t.typography.normalWeight),
    "--cr-font-medium": String(t.typography.mediumWeight),
    "--cr-font-bold": String(t.typography.boldWeight),
    "--cr-space": `${t.spacing.unit * t.spacing.scale}px`,
    "--cr-control-height": `${t.sizing.controlHeight}px`,
    "--cr-container": `${t.sizing.container}px`,
    "--cr-border-width": `${t.borders.width}px`,
    "--cr-border-style": t.borders.style,
    "--cr-shadow": shadowValues[t.shadows],
    "--cr-motion": `${t.motion.duration}ms`,
    "--cr-easing": t.motion.easing,
  });
  for (const [name, value] of Object.entries(t.breakpoints))
    values[`--cr-breakpoint-${name}`] = `${value}px`;
  for (const [name, value] of Object.entries(t.zIndex))
    values[`--cr-z-${name}`] = String(value);
  for (const component of new Set([
    ...Object.keys(system.recipes),
    ...Object.keys(system.overrides),
  ])) {
    const recipe = resolveRecipe(system, component);
    for (const [name, value] of Object.entries(recipe))
      values[`--cr-${component}-${kebab(name)}`] =
        name === "shadow"
          ? shadowValues[value as keyof typeof shadowValues]
          : String(value);
  }
  return values;
}
export function generateCSS(system: DesignSystem, selector = ":root"): string {
  if (!/^(:root|\.[a-zA-Z][a-zA-Z0-9_-]*)$/.test(selector))
    throw new Error("Invalid CSS scope");
  const checked = designSystemSchema.parse(system);
  const rules = [
    ...new Set([
      ...Object.keys(checked.recipes),
      ...Object.keys(checked.overrides),
    ]),
  ].map((component) => {
    const declarations = Object.entries({
      ...checked.recipes[component],
      ...checked.overrides[component],
    }).map(([key, value]) => {
      const property =
        (
          {
            radius: "border-radius",
            foreground: "color",
            shadow: "box-shadow",
          } as Record<string, string>
        )[key] || kebab(key);
      return `  ${property}: ${key === "shadow" ? shadowValues[value as keyof typeof shadowValues] : value};`;
    });
    return `${selector} .cr-${component} {\n${declarations.join("\n")}\n}`;
  });
  return `/* ${system.name.replace(/[<>\r\n]|\*\//g, "")} — CodeRocket schema v1 */\n${selector} {\n${Object.entries(
    tokenVariables(system),
  )
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n  color-scheme: ${system.mode};\n}\n${rules.join("\n")}\n`;
}
export const patchOperationSchema = z
  .object({
    op: z.enum(["set", "remove"]),
    path: z.string().min(1).max(160),
    value: z.union([z.string().max(200), z.number(), recipeSchema]).optional(),
  })
  .strict();
export const designProposalSchema = z
  .object({
    summary: z.string().min(1).max(400),
    operations: z.array(patchOperationSchema).max(100),
    clarification: z.string().max(500).nullable(),
  })
  .strict()
  .refine(
    (value) => value.operations.length > 0 || Boolean(value.clarification),
    "A proposal needs changes or a clarification.",
  );
export type DesignProposal = z.infer<typeof designProposalSchema>;
export function applyOperations(
  input: DesignSystem,
  operations: z.infer<typeof patchOperationSchema>[],
): DesignSystem {
  const result = structuredClone(designSystemSchema.parse(input));
  for (const raw of operations) {
    const operation = patchOperationSchema.parse(raw),
      parts = operation.path.split(".");
    if (
      parts.some(
        (p) => !p || ["__proto__", "prototype", "constructor"].includes(p),
      )
    )
      throw new Error("Unsafe patch path");
    if (!["tokens", "recipes", "overrides", "name"].includes(parts[0]))
      throw new Error("Unsupported patch path");
    if (operation.op === "remove") {
      if (parts.length !== 2 || !["overrides", "recipes"].includes(parts[0]))
        throw new Error("Only recipe overrides can be removed");
      delete result[parts[0] as "overrides" | "recipes"][parts[1]];
      continue;
    }
    let cursor = result as unknown as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) {
      if (
        cursor[part] === undefined &&
        ["recipes", "overrides"].includes(parts[0])
      )
        cursor[part] = {};
      if (
        !cursor[part] ||
        typeof cursor[part] !== "object" ||
        Array.isArray(cursor[part])
      )
        throw new Error("Unknown patch path");
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = operation.value;
  }
  return designSystemSchema.parse(result);
}
export function contrastRatio(a: string, b: string): number {
  const luminance = (color: string) => {
    const normalized = hex.parse(color).slice(1);
    const channels = [0, 2, 4]
      .map((n) => parseInt(normalized.slice(n, n + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function accessibilityReport(system: DesignSystem) {
  const c = system.tokens.colors;
  return [
    ["Text", "foreground", "background"],
    ["Surface", "surfaceForeground", "surface"],
    ["Primary", "primaryForeground", "primary"],
    ["Secondary", "secondaryForeground", "secondary"],
    ["Muted text", "mutedForeground", "muted"],
    ["Success", "successForeground", "success"],
    ["Warning", "warningForeground", "warning"],
    ["Destructive", "destructiveForeground", "destructive"],
  ].map(([label, fg, bg]) => {
    const ratio = contrastRatio(
      c[fg as keyof typeof c],
      c[bg as keyof typeof c],
    );
    return { label, ratio, passes: ratio >= 4.5 };
  });
}
export function diffSystems(
  before: DesignSystem,
  after: DesignSystem,
): Array<{ path: string; before: unknown; after: unknown }> {
  const changes: Array<{ path: string; before: unknown; after: unknown }> = [];
  function walk(a: unknown, b: unknown, path: string) {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === "object" && typeof b === "object") {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        walk(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
          path ? `${path}.${key}` : key,
        );
    } else changes.push({ path, before: a, after: b });
  }
  walk(before, after, "");
  return changes;
}
export interface RenderedFile {
  path: string;
  content: string;
  type: "source" | "style" | "metadata" | "test" | "story";
}
export interface FrameworkRenderer<Spec> {
  framework: Framework;
  render(system: DesignSystem, spec: Spec): RenderedFile[];
}
