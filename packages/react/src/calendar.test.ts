import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Calendar,
  addCalendarDays,
  addCalendarMonths,
  calendarLabels,
  endOfCalendarMonth,
  isCalendarRangeAvailable,
  isoWeekNumber,
  parseCalendarDate,
} from "./components/calendar";
import { DatePicker } from "./components/date-picker";

describe("Gregorian date arithmetic", () => {
  it("preserves dates without timezone conversion, including leap days and early years", () => {
    for (const value of [
      "2024-02-29",
      "2026-03-29",
      "2026-10-25",
      "0001-01-01",
      "9999-12-31",
    ])
      expect(parseCalendarDate(value).toISOString().slice(0, 10)).toBe(value);
    for (const value of [
      "2023-02-29",
      "2026-04-31",
      "2026-13-01",
      "0000-01-01",
      "2026-09-17T00:00:00Z",
    ])
      expect(() => parseCalendarDate(value)).toThrow();
  });
  it("adds months without overflowing short months or the supported date interval", () => {
    expect(addCalendarMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addCalendarMonths("2025-01-31", 1)).toBe("2025-02-28");
    expect(addCalendarMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addCalendarMonths("0001-01-01", -1)).toBe("0001-01-01");
    expect(addCalendarMonths("9999-12-31", 1)).toBe("9999-12-31");
    expect(endOfCalendarMonth("0099-02-01")).toBe("0099-02-28");
    expect(endOfCalendarMonth("9999-12-01")).toBe("9999-12-31");
  });
  it("crosses daylight-saving days and leap-year boundaries as calendar days", () => {
    expect(addCalendarDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addCalendarDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addCalendarDays("2024-02-28", 2)).toBe("2024-03-01");
    expect(addCalendarDays("0001-01-01", -1)).toBe("0001-01-01");
    expect(addCalendarDays("9999-12-31", 1)).toBe("9999-12-31");
  });
  it("uses ISO week numbers at year boundaries", () => {
    expect(isoWeekNumber("2021-01-01")).toBe(53);
    expect(isoWeekNumber("2021-01-04")).toBe(1);
    expect(isoWeekNumber("2024-12-30")).toBe(1);
  });
});

describe("range availability", () => {
  const range = { start: "2026-09-10", end: "2026-09-20" };
  it("rejects invalid, reversed and out-of-bounds ranges", () => {
    expect(
      isCalendarRangeAvailable({ start: "2026-09-31", end: "2026-10-01" }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable({ start: range.end, end: range.start }),
    ).toBe(false);
    expect(isCalendarRangeAvailable(range, { min: "2026-09-11" })).toBe(false);
    expect(isCalendarRangeAvailable(range, { max: "2026-09-19" })).toBe(false);
    expect(
      isCalendarRangeAvailable(range, { min: range.start, max: range.end }),
    ).toBe(true);
  });
  it("rejects an unavailable day inside a range, using both array and predicate rules", () => {
    expect(
      isCalendarRangeAvailable(range, { disabledDates: ["2026-09-15"] }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable(range, {
        disabledDates: (date) => date === "2026-09-15",
      }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable(range, { disabledDates: ["2026-09-21"] }),
    ).toBe(true);
  });
  it("can allow unavailable interior dates but never unavailable endpoints", () => {
    expect(
      isCalendarRangeAvailable(range, {
        disabledDates: ["2026-09-15"],
        excludeDisabled: false,
      }),
    ).toBe(true);
    expect(
      isCalendarRangeAvailable(range, {
        disabledDates: [range.start],
        excludeDisabled: false,
      }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable(range, {
        disabledDates: [range.end],
        excludeDisabled: false,
      }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable({ start: range.start, end: range.start }),
    ).toBe(true);
  });
});

describe("calendar rendering contracts", () => {
  it("renders a deterministic SSR placeholder without a selected or starting date", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-31T23:59:00Z"));
      const january = renderToStaticMarkup(createElement(Calendar));
      vi.setSystemTime(new Date("2026-02-01T09:00:00Z"));
      const february = renderToStaticMarkup(createElement(Calendar));
      expect(january).toBe(february);
      expect(january).toContain('aria-busy="true"');
      expect(january).not.toContain("data-date=");
    } finally {
      vi.useRealTimers();
    }
  });
  it("renders explicit SSR dates immediately without a server-local today marker", () => {
    const markup = renderToStaticMarkup(
      createElement(Calendar, { startFrom: "2026-09-01" }),
    );
    expect(markup).toContain('data-date="2026-09-01"');
    expect(markup).not.toContain('aria-current="date"');
    expect(markup).not.toContain('aria-busy="true"');
  });

  it("keeps a keyboard entry point when the requested start day is unavailable", () => {
    const markup = renderToStaticMarkup(
      createElement(Calendar, {
        startFrom: "2026-09-01",
        disabledDates: ["2026-09-01"],
      }),
    );
    expect(markup.match(/data-date="[^"]+"[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(markup).toContain('data-date="2026-09-01"');
    expect(markup).toContain('aria-disabled="true"');
  });
  it("renders a two-month range without duplicate date buttons", () => {
    const markup = renderToStaticMarkup(
      createElement(Calendar, {
        mode: "range",
        value: { start: "2026-09-29", end: "2026-10-03" },
        locale: "fr",
        showWeekNumbers: true,
      }),
    );
    const dates = [...markup.matchAll(/data-date="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(new Set(dates).size).toBe(dates.length);
    expect(markup.match(/data-date="[^"]+"[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Mois précédent"');
    expect(markup).toContain('aria-label="Semaine"');
    expect(markup.match(/aria-selected="true"/g)).toHaveLength(5);
  });
  it("keeps Gregorian labels when a locale requests a different calendar", () => {
    const markup = renderToStaticMarkup(
      createElement(Calendar, {
        startFrom: "2026-09-01",
        locale: "en-u-ca-islamic",
      }),
    );
    expect(markup).toContain("September 2026");
    expect(markup).toContain("Tuesday, September 1, 2026");
    expect(markup).not.toContain("Rabi");
  });
  it("supports the minimum and maximum calendar years", () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(Calendar, { startFrom: "0001-01-01" }),
      ),
    ).not.toThrow();
    expect(() =>
      renderToStaticMarkup(
        createElement(Calendar, {
          mode: "range",
          startFrom: "9999-12-31",
          showWeekNumbers: true,
        }),
      ),
    ).not.toThrow();
  });
  it("serializes date fields independently of display formatting", () => {
    const single = renderToStaticMarkup(
      createElement(DatePicker, {
        name: "delivery",
        defaultValue: "2026-09-19",
        formatDate: () => "Custom date",
      }),
    );
    expect(single).toContain('name="delivery" value="2026-09-19"');
    expect(single).toContain("Custom date");
    const range = renderToStaticMarkup(
      createElement(DatePicker, {
        mode: "range",
        inline: true,
        name: "period",
        locale: "fr",
        autoApply: false,
        defaultValue: { start: "2026-09-19", end: "2026-09-25" },
      }),
    );
    expect(range).toContain('name="period[start]" value="2026-09-19"');
    expect(range).toContain('name="period[end]" value="2026-09-25"');
    expect(range).toContain("Appliquer");
    expect(range).toContain("Annuler");
    expect(range).toContain('type="date"');
  });
  it("localizes all actions and supports explicit label overrides", () => {
    expect(calendarLabels("fr-CA").clear).toBe("Effacer");
    expect(calendarLabels("fr", { apply: "Confirmer" }).apply).toBe(
      "Confirmer",
    );
  });
});
