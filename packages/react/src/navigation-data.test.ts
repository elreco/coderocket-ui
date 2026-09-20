import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./components/calendar";
import { DatePicker } from "./components/date-picker";
import { Pagination } from "./components/pagination";
import { DataTable } from "./components/data-table";
import { Table } from "./components/table";
import { Tabs } from "./components/tabs";
import { Accordion } from "./components/accordion";
import { Collapsible } from "./components/collapsible";
import { Combobox } from "./components/combobox";

const html = (element: ReactElement) => renderToStaticMarkup(element);
const noop = () => {};

describe("calendar selection and date boundaries", () => {
  it("treats controlled null as empty even with an old default", () => {
    const result = html(
      createElement(Calendar, { value: null, defaultValue: "2024-02-29" }),
    );
    expect(result).not.toContain('data-selected="true"');
    expect(result).not.toContain('aria-selected="true"');
  });

  it("renders leap days and keeps unavailable adjacent years out of the grid", () => {
    expect(
      html(createElement(Calendar, { defaultValue: "2024-02-29" })),
    ).toMatch(/data-date="2024-02-29"[^>]*data-selected="true"/);
    expect(
      html(createElement(Calendar, { defaultValue: "2023-02-28" })),
    ).not.toContain('data-date="2023-02-29"');
    for (const value of ["0001-01-01", "9999-12-31"]) {
      const result = html(
        createElement(Calendar, { value, min: value, max: value }),
      );
      expect(result.match(/data-date="[^"]+"[^>]*tabindex="0"/g)).toHaveLength(
        1,
      );
      expect(result).not.toMatch(/data-date="(?:0000|\+010000)/);
    }
  });

  it("rejects an inverted interval and clamps the only keyboard stop into bounds", () => {
    expect(() =>
      html(createElement(Calendar, { min: "2026-09-20", max: "2026-09-01" })),
    ).toThrow("Calendar min exceeds max");
    const result = html(
      createElement(Calendar, {
        value: "2026-09-01",
        min: "2026-09-15",
        max: "2026-09-20",
      }),
    );
    expect(result).toMatch(/data-date="2026-09-15"[^>]*tabindex="0"/);
    expect(result).toMatch(
      /data-date="2026-09-14"[^>]*disabled=""[^>]*tabindex="-1"/,
    );
  });

  it("keeps date-picker labels on the selected calendar date across DST/timezones", () => {
    try {
      for (const timezone of [
        "Europe/Paris",
        "America/New_York",
        "Pacific/Kiritimati",
      ]) {
        vi.stubEnv("TZ", timezone);
        for (const value of [
          "2026-03-08",
          "2026-03-29",
          "2026-10-25",
          "2026-11-01",
        ]) {
          const result = html(
            createElement(DatePicker, { value, locale: "en-US", name: "due" }),
          );
          expect(result).toContain(`value="${value}"`);
          const expected = new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date(`${value}T12:00:00Z`));
          expect(result).toContain(`aria-label="Choose a date: ${expected}"`);
        }
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("clears and disables both the picker trigger and submitted value", () => {
    const result = html(
      createElement(DatePicker, {
        label: "Due date",
        value: null,
        defaultValue: "2024-02-29",
        name: "due",
        disabled: true,
      }),
    );
    expect(result).toMatch(
      /<input(?=[^>]*name="due")(?=[^>]*disabled="")(?=[^>]*value="")/,
    );
    expect(result).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Due date"/);
    expect(result).not.toContain("Feb 29");
  });
});

describe("navigation and data rendering contracts", () => {
  it.each([
    [Number.NaN, Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 9, 1],
    [2.8, 7.9, 2],
    [-10, 5, 1],
    [20, 5, 5],
  ])(
    "normalizes page %s and total %s to a valid current page",
    (page, totalPages, current) => {
      const result = html(
        createElement(Pagination, { page, totalPages, onPageChange: noop }),
      );
      expect(result).toMatch(
        new RegExp(`aria-current="page"[^>]*aria-label="Page ${current}"`),
      );
      expect(result).not.toContain("Page NaN");
      expect(result).not.toContain("Page Infinity");
    },
  );

  const rows = Array.from({ length: 7 }, (_, index) => ({
    name: `Record ${index + 1}`,
  }));
  it.each([
    [Number.NaN, 5],
    [Number.POSITIVE_INFINITY, 5],
    [0, 1],
    [2.8, 2],
  ])(
    "normalizes data page size %s without dropping rows",
    (pageSize, expected) => {
      const result = html(
        createElement(DataTable, {
          caption: "Members",
          columns: [{ key: "name", label: "Name" }],
          rows,
          pageSize,
        }),
      );
      const body = result.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
      expect(body.match(/<tr>/g)).toHaveLength(expected);
      expect(result).toContain(`1–${expected} of 7 records`);
      expect(result).toContain('aria-label="Sort by Name, ascending"');
    },
  );

  it("exposes labelled keyboard-scroll regions for both table types", () => {
    const table = html(
      createElement(Table, {
        caption: "Activity",
        columns: ["Event"],
        rows: [["Created"]],
      }),
    );
    const data = html(
      createElement(DataTable, {
        caption: "Members",
        columns: [{ key: "name", label: "Name" }],
        rows: [],
      }),
    );
    expect(table).toContain('role="region" aria-label="Activity" tabindex="0"');
    expect(data).toContain('role="region" aria-label="Members" tabindex="0"');
    expect(data).toContain('role="status">0 records');
    expect(data).toContain('aria-label="Members pages"');
  });

  it("starts on the first enabled tab when the first item is disabled", () => {
    const result = html(
      createElement(Tabs, {
        label: "Settings",
        items: [
          {
            value: "locked",
            label: "Locked",
            content: "Hidden",
            disabled: true,
          },
          { value: "ready", label: "Ready", content: "Available" },
        ],
      }),
    );
    expect(result).toMatch(/aria-selected="true"[^>]*>Ready<\/button>/);
    expect(result).not.toMatch(/aria-selected="true"[^>]*>Locked<\/button>/);
  });

  it("forwards disabled state to accordion, collapsible and combobox controls", () => {
    expect(
      html(
        createElement(Accordion, {
          disabled: true,
          items: [{ value: "a", title: "Details", content: "Content" }],
        }),
      ),
    ).toMatch(/<button[^>]*disabled=""/);
    expect(
      html(
        createElement(Collapsible, {
          disabled: true,
          title: "Details",
          children: "Content",
        }),
      ),
    ).toMatch(/<button[^>]*disabled=""/);
    const combo = html(
      createElement(Combobox, {
        label: "Country",
        items: ["France"],
        defaultValue: "France",
        name: "country",
        disabled: true,
      }),
    );
    expect(combo).toMatch(/<input[^>]*disabled=""/);
    expect(combo).toContain('value="France"');
  });
});
