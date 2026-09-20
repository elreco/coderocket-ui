import { z } from "zod";
import {
  applyOperations,
  colorsSchema,
  diffSystems,
  type DesignSystem,
  type DesignProposal,
} from "./index";
const reportSchema = z.object({
  schemaVersion: z.literal(1),
  framework: z.string().max(40),
  cssVariables: z
    .record(z.string().max(100), z.string().max(500))
    .refine((values) => Object.keys(values).length <= 2000),
  fonts: z.array(z.string().max(500)).max(200),
  components: z.array(z.string().max(500)).max(2000),
});
const kebab = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
function color(value: string) {
  if (/^#[a-f\d]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[a-f\d]{3}$/i.test(value))
    return "#" + [...value.slice(1)].map((letter) => letter.repeat(2)).join("");
  return null;
}
/** Imports only known scalar tokens. Code and configuration from the report are never executed. */
export function importProposal(raw: unknown, system: DesignSystem) {
  const report = reportSchema.parse(raw),
    operations: DesignProposal["operations"] = [],
    ignored: string[] = [];
  for (const key of Object.keys(colorsSchema.shape)) {
    const name = kebab(key),
      aliases = [
        `--cr-${name}`,
        `--${name}`,
        ...(key === "surface"
          ? ["--card"]
          : key === "surfaceForeground"
            ? ["--card-foreground"]
            : []),
      ];
    const found = aliases.find((alias) =>
      Object.hasOwn(report.cssVariables, alias),
    );
    if (!found) continue;
    const value = color(report.cssVariables[found]);
    if (value)
      operations.push({ op: "set", path: `tokens.colors.${key}`, value });
    else
      ignored.push(
        `${found}: convert this color to six-digit hex before importing.`,
      );
  }
  for (const key of ["sm", "md", "lg", "xl"]) {
    const aliases = [
      `--cr-radius-${key}`,
      `--radius-${key}`,
      ...(key === "md" ? ["--radius"] : []),
    ];
    const found = aliases.find((alias) =>
      Object.hasOwn(report.cssVariables, alias),
    );
    if (!found) continue;
    const value = report.cssVariables[found];
    if (/^(0|\d{1,3}(\.\d{1,3})?(px|rem))$/.test(value))
      operations.push({ op: "set", path: `tokens.radius.${key}`, value });
    else ignored.push(`${found}: unsupported length.`);
  }
  const font = report.fonts[0];
  if (font) {
    const value = /monospace|mono/i.test(font)
      ? "mono"
      : /georgia|times|ui-serif/i.test(font)
        ? "serif"
        : null;
    if (value)
      operations.push({
        op: "set",
        path: "tokens.typography.fontFamily",
        value,
      });
    else
      ignored.push(
        "Custom fonts require installation in the integrating application.",
      );
  }
  const next = applyOperations(system, operations),
    changes = diffSystems(system, next);
  return {
    framework: report.framework,
    components: report.components,
    ignored,
    changes,
    next,
  };
}
