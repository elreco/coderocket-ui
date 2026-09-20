import { it, expect } from "vitest";
import { createDesignSystem } from "./index";
import { importProposal } from "./import";
it("imports only recognized scalar tokens and leaves source paths as an inventory", () => {
  const initial = createDesignSystem(),
    report = {
      schemaVersion: 1,
      framework: "Vite",
      cssVariables: {
        "--primary": "#f00",
        "--radius": "4px",
        "--surface": "url(https://evil.example)",
        "--custom": "anything",
      },
      fonts: ["Georgia, serif"],
      components: ["components/Card.tsx"],
    };
  const result = importProposal(report, initial);
  expect(result.next.tokens.colors.primary).toBe("#ff0000");
  expect(result.next.tokens.radius.md).toBe("4px");
  expect(result.next.tokens.typography.fontFamily).toBe("serif");
  expect(result.ignored).toHaveLength(1);
  expect(initial.tokens.colors.primary).not.toBe("#ff0000");
  expect(result.components).toEqual(report.components);
});
