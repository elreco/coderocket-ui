import { describe, it, expect } from "vitest";
import {
  createDesignSystem,
  applyOperations,
  resolveRecipe,
  generateCSS,
  accessibilityReport,
  contrastRatio,
  diffSystems,
  designSystemSchema,
} from "./index";
describe("Design-system model", () => {
  it("keeps recipes and component overrides when global tokens change", () => {
    const initial = createDesignSystem();
    initial.recipes.button = { height: "44px" };
    initial.overrides.dialog = { radius: "24px" };
    const updated = applyOperations(initial, [
      { op: "set", path: "tokens.radius.md", value: "2px" },
    ]);
    expect(resolveRecipe(updated, "button")).toMatchObject({
      height: "44px",
      radius: "2px",
    });
    expect(resolveRecipe(updated, "dialog")).toMatchObject({ radius: "24px" });
    expect(resolveRecipe(updated, "dialog", { radius: "32px" }).radius).toBe(
      "32px",
    );
    expect(initial.tokens.radius.md).toBe("8px");
  });
  it("resets overrides and rejects malformed or dangerous patches atomically", () => {
    const initial = createDesignSystem();
    initial.overrides.button = { radius: "0" };
    expect(
      applyOperations(initial, [{ op: "remove", path: "overrides.button" }])
        .overrides,
    ).toEqual({});
    for (const path of [
      "tokens.__proto__.polluted",
      "framework",
      "tokens.unknown",
      "tokens.radius.nope",
    ])
      expect(() =>
        applyOperations(initial, [{ op: "set", path, value: "invalid" }]),
      ).toThrow();
    expect(() =>
      applyOperations(initial, [
        {
          op: "set",
          path: "tokens.colors.primary",
          value: "red; background:url(https://example.com)",
        },
      ]),
    ).toThrow();
    expect(initial.tokens.colors.primary).toBe("#4355db");
  });
  it("produces deterministic portable CSS and passes default text contrast", () => {
    for (const mode of ["light", "dark"] as const) {
      const model = createDesignSystem("Test", mode);
      expect(generateCSS(model)).toBe(generateCSS(model));
      expect(accessibilityReport(model).every((r) => r.passes)).toBe(true);
    }
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(() =>
      generateCSS(createDesignSystem(), "body { color: red }"),
    ).toThrow();
  });
  it("validates bounded tokens and reports exact changes", () => {
    const a = createDesignSystem();
    const b = applyOperations(a, [
      { op: "set", path: "tokens.sizing.controlHeight", value: 48 },
    ]);
    expect(diffSystems(a, b)).toEqual([
      { path: "tokens.sizing.controlHeight", before: 40, after: 48 },
    ]);
    expect(
      designSystemSchema.safeParse({ ...a, framework: "vue" }).success,
    ).toBe(true);
    expect(
      designSystemSchema.safeParse({ ...a, framework: "svelte" }).success,
    ).toBe(false);
    expect(() =>
      applyOperations(a, [
        { op: "set", path: "tokens.sizing.controlHeight", value: 5000 },
      ]),
    ).toThrow();
  });
});
