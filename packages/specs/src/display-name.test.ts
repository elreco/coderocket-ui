import { describe, expect, it } from "vitest";
import {
  getCatalogueDisplayName,
  getComponent,
  getBlock,
  searchComponents,
  searchBlocks,
} from "./index";

describe("catalogue names for people", () => {
  it.each([
    ["ContextMenu", "Context Menu"],
    ["DatePicker", "Date Picker"],
    ["RadioGroup", "Radio Group"],
    ["DataTableBlock", "Data Table"],
    ["EmptyStateBlock", "Empty State"],
    ["ApiKeysBlock", "API Keys"],
    ["OtpBlock", "OTP"],
    ["FaqBlock", "FAQ"],
    ["CtaBlock", "Call to Action"],
    ["Kbd", "Keyboard Key"],
    ["SignupBlock", "Sign Up"],
    ["Button", "Button"],
  ])("labels %s as %s", (name, label) => {
    expect(getCatalogueDisplayName(name)).toBe(label);
  });

  it("finds spaced labels while preserving code identifiers and slugs", () => {
    expect(searchComponents("context menu")).toContainEqual(
      expect.objectContaining({ name: "ContextMenu", slug: "context-menu" }),
    );
    expect(searchComponents("keyboard key")).toContainEqual(
      expect.objectContaining({ name: "Kbd", slug: "kbd" }),
    );
    expect(searchBlocks("api keys")).toContainEqual(
      expect.objectContaining({ name: "ApiKeysBlock", slug: "api-keys" }),
    );
    expect(searchBlocks("call to action")).toContainEqual(
      expect.objectContaining({ name: "CtaBlock", slug: "cta" }),
    );
    expect(searchComponents("DatePicker")).toContainEqual(
      getComponent("date-picker"),
    );
    expect(searchBlocks("DataTableBlock")).toContainEqual(
      getBlock("data-table"),
    );
  });
});
