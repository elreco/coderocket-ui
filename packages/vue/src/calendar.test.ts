// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "@vue/server-renderer";
import { PopoverContent } from "reka-ui";
import Calendar from "./components/calendar.vue";
import DatePicker from "./components/date-picker.vue";
import {
  addCalendarDays,
  addCalendarMonths,
  calendarLabels,
  calendarToday,
  endOfCalendarMonth,
  isCalendarRangeAvailable,
  isoWeekNumber,
  parseCalendarDate,
} from "./components/calendar-utils";

const wrappers: VueWrapper[] = [];
function keep<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const ssr = (component: typeof Calendar | typeof DatePicker, props = {}) =>
  renderToString(createSSRApp({ render: () => h(component, props) }));
const button = (wrapper: VueWrapper, label: string) =>
  wrapper.findAll("button").find((item) => item.text() === label)!;

describe("Vue Gregorian calendar arithmetic", () => {
  it("strictly parses leap days, early years, DST days and date boundaries", () => {
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
  it("adds calendar days and months without overflow or timezone conversion", () => {
    expect(addCalendarMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addCalendarMonths("2025-01-31", 1)).toBe("2025-02-28");
    expect(addCalendarMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addCalendarMonths("0001-01-01", -1)).toBe("0001-01-01");
    expect(addCalendarMonths("9999-12-31", 1)).toBe("9999-12-31");
    expect(endOfCalendarMonth("0099-02-01")).toBe("0099-02-28");
    expect(endOfCalendarMonth("9999-12-01")).toBe("9999-12-31");
    expect(addCalendarDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addCalendarDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addCalendarDays("2024-02-28", 2)).toBe("2024-03-01");
    expect(addCalendarDays("0001-01-01", -1)).toBe("0001-01-01");
    expect(addCalendarDays("9999-12-31", 1)).toBe("9999-12-31");
  });
  it("uses ISO week numbering at year boundaries", () => {
    expect(isoWeekNumber("2021-01-01")).toBe(53);
    expect(isoWeekNumber("2021-01-04")).toBe(1);
    expect(isoWeekNumber("2024-12-30")).toBe(1);
  });
  it("checks reversed/invalid ranges, bounds, endpoints and disabled interiors", () => {
    const range = { start: "2026-09-10", end: "2026-09-20" };
    expect(
      isCalendarRangeAvailable({ start: range.end, end: range.start }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable({ start: "2026-09-31", end: "2026-10-01" }),
    ).toBe(false);
    expect(isCalendarRangeAvailable(range, { min: "2026-09-11" })).toBe(false);
    expect(isCalendarRangeAvailable(range, { max: "2026-09-19" })).toBe(false);
    expect(
      isCalendarRangeAvailable(range, { min: range.start, max: range.end }),
    ).toBe(true);
    expect(
      isCalendarRangeAvailable(range, { disabledDates: ["2026-09-15"] }),
    ).toBe(false);
    expect(
      isCalendarRangeAvailable(range, {
        disabledDates: (date) => date === "2026-09-15",
      }),
    ).toBe(false);
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

describe("Vue date SSR and presentation", () => {
  it("renders deterministic skeletons independent of the server date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-31T23:59:00Z"));
    const january = await ssr(Calendar);
    vi.setSystemTime(new Date("2026-02-01T09:00:00Z"));
    expect(await ssr(Calendar)).toBe(january);
    expect(january).toContain('aria-busy="true"');
    expect(january).not.toContain("data-date=");
  });
  it("hydrates the no-date skeleton before choosing the user's local day", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = await ssr(Calendar);
    const warn = vi.fn();
    const app = createSSRApp({ render: () => h(Calendar) });
    app.config.warnHandler = warn;
    app.mount(host);
    try {
      await nextTick();
      expect(warn).not.toHaveBeenCalled();
      expect(host.querySelector('[aria-busy="true"]')).toBeNull();
      expect(
        host.querySelector('[aria-current="date"]')?.getAttribute("data-date"),
      ).toBe(calendarToday());
    } finally {
      app.unmount();
    }
  });
  it("refreshes local today on window focus and cleans up its midnight timer", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
    const wrapper = mount(Calendar, { props: { startFrom: "2026-09-01" } });
    await nextTick();
    expect(wrapper.get('[aria-current="date"]').attributes("data-date")).toBe(
      calendarToday(),
    );
    vi.setSystemTime(new Date("2026-09-20T12:00:00Z"));
    window.dispatchEvent(new Event("focus"));
    await nextTick();
    expect(wrapper.get('[aria-current="date"]').attributes("data-date")).toBe(
      calendarToday(),
    );
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("renders explicit dates on the server without server-local today markers", async () => {
    const html = await ssr(Calendar, { startFrom: "2026-09-01" });
    expect(html).toContain('data-date="2026-09-01"');
    expect(html).not.toContain('aria-current="date"');
    expect(html).not.toContain('aria-busy="true"');
  });
  it("renders unique two-month days, one tabbable day, French labels and week numbers", async () => {
    const html = await ssr(Calendar, {
      mode: "range",
      modelValue: { start: "2026-09-29", end: "2026-10-03" },
      locale: "fr",
      showWeekNumbers: true,
    });
    const dates = [...html.matchAll(/data-date="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(new Set(dates).size).toBe(dates.length);
    expect(html.match(/data-date="[^"]+"[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Mois précédent"');
    expect(html).toContain('aria-label="Semaine"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(5);
  });
  it("keeps a keyboard entry point when the requested start day is unavailable", async () => {
    const html = await ssr(Calendar, {
      startFrom: "2026-09-01",
      disabledDates: ["2026-09-01"],
    });
    expect(html.match(/data-date="[^"]+"[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('aria-disabled="true"');
  });
  it("keeps Gregorian labels even when the locale requests another calendar", async () => {
    const html = await ssr(Calendar, {
      startFrom: "2026-09-01",
      locale: "en-u-ca-islamic",
    });
    expect(html).toContain("September 2026");
    expect(html).toContain("Tuesday, September 1, 2026");
    expect(html).not.toContain("Rabi");
  });
  it("renders the complete supported year interval", async () => {
    expect(await ssr(Calendar, { startFrom: "0001-01-01" })).toContain(
      'data-date="0001-01-01"',
    );
    expect(
      await ssr(Calendar, {
        mode: "range",
        startFrom: "9999-12-31",
        showWeekNumbers: true,
      }),
    ).toContain('data-date="9999-12-31"');
  });
  it("serializes ISO values independently of display formatting and localizes actions", async () => {
    const single = await ssr(DatePicker, {
      name: "delivery",
      defaultValue: "2026-09-19",
      formatDate: () => "Custom date",
    });
    expect(single).toContain('name="delivery" value="2026-09-19"');
    expect(single).toContain("Custom date");
    const range = await ssr(DatePicker, {
      mode: "range",
      inline: true,
      name: "period",
      locale: "fr",
      autoApply: false,
      defaultValue: { start: "2026-09-19", end: "2026-09-25" },
    });
    expect(range).toContain('name="period[start]" value="2026-09-19"');
    expect(range).toContain('name="period[end]" value="2026-09-25"');
    expect(range).toContain("Appliquer");
    expect(range).toContain("Annuler");
    expect(range).toContain('type="date"');
    expect(calendarLabels("fr-CA").clear).toBe("Effacer");
    expect(calendarLabels("fr", { apply: "Confirmer" }).apply).toBe(
      "Confirmer",
    );
  });
  it("provides native Vue custom day, trigger and icon slots", async () => {
    const day = keep(
      mount(Calendar, {
        props: { startFrom: "2026-09-01" },
        slots: {
          day: ({ date, day }: { date: string; day: number }) =>
            h("span", { title: date }, `Day ${day}`),
        },
      }),
    );
    expect(day.get('[data-date="2026-09-01"]').text()).toBe("Day 1");
    const trigger = keep(
      mount(DatePicker, {
        props: { defaultValue: "2026-09-19" },
        slots: {
          trigger: ({ value }: { value: string }) =>
            h("span", `Selected: ${value}`),
        },
      }),
    );
    expect(trigger.get("button").text()).toContain("Selected: Sep 19, 2026");
  });
});

describe("Vue calendar interaction", () => {
  it("selects a cross-month range in either direction and rejects disabled interiors", async () => {
    const wrapper = keep(
      mount(Calendar, {
        props: {
          mode: "range",
          startFrom: "2026-09-01",
          disabledDates: ["2026-09-30"],
        },
      }),
    );
    await nextTick();
    await wrapper.get('[data-date="2026-10-03"]').trigger("click");
    expect(wrapper.emitted("selectionPendingChange")?.at(-1)).toEqual([true]);
    await wrapper.get('[data-date="2026-09-29"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.text()).toContain(
      "This range contains an unavailable date.",
    );
    await wrapper.setProps({ excludeDisabled: false });
    await wrapper.get('[data-date="2026-09-29"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      { start: "2026-09-29", end: "2026-10-03" },
    ]);
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(5);
  });
  it("moves focus with arrows, week boundaries and month/year keys, skipping disabled days", async () => {
    const wrapper = keep(
      mount(Calendar, {
        attachTo: document.body,
        props: { startFrom: "2026-09-01", disabledDates: ["2026-09-02"] },
      }),
    );
    const day = (date: string) => wrapper.get(`[data-date="${date}"]`);
    await day("2026-09-01").trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-09-03",
    );
    await day("2026-09-03").trigger("keydown", { key: "End" });
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-09-06",
    );
    await day("2026-09-06").trigger("keydown", { key: "Home" });
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-08-31",
    );
    await day("2026-08-31").trigger("keydown", { key: "PageDown" });
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2026-09-30",
    );
    await day("2026-09-30").trigger("keydown", {
      key: "PageDown",
      shiftKey: true,
    });
    expect(document.activeElement?.getAttribute("data-date")).toBe(
      "2027-09-30",
    );
    expect(wrapper.emitted("monthChange")?.at(-1)).toEqual(["2027-09-01"]);
  });
  it("cancels an incomplete range with Escape and keeps the existing committed selection", async () => {
    const wrapper = keep(
      mount(Calendar, {
        props: {
          mode: "range",
          defaultValue: { start: "2026-09-10", end: "2026-09-12" },
        },
      }),
    );
    await wrapper.get('[data-date="2026-09-20"]').trigger("click");
    await wrapper
      .get('[data-date="2026-09-20"]')
      .trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("selectionPendingChange")?.at(-1)).toEqual([false]);
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(3);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
  it("supports month/year jumps and restores invalid year input", async () => {
    const wrapper = keep(
      mount(Calendar, {
        props: {
          startFrom: "2026-09-01",
          min: "2025-01-01",
          max: "2030-12-31",
        },
      }),
    );
    await wrapper.get("select").setValue("11");
    expect(wrapper.find('[data-date="2026-12-01"]').exists()).toBe(true);
    const year = wrapper.get('input[type="number"]');
    await year.setValue("2028");
    await year.trigger("blur");
    expect(wrapper.find('[data-date="2028-12-01"]').exists()).toBe(true);
    await wrapper.get('input[type="number"]').setValue("9999");
    await wrapper.get('input[type="number"]').trigger("blur");
    expect(
      (wrapper.get('input[type="number"]').element as HTMLInputElement).value,
    ).toBe("2028");
  });
});

describe("Vue date picker drafts and native forms", () => {
  it("requires a completed range before Apply and restores committed values on Cancel", async () => {
    const wrapper = keep(
      mount(DatePicker, {
        props: {
          mode: "range",
          inline: true,
          autoApply: false,
          shortcuts: false,
          name: "period",
          defaultValue: { start: "2026-09-10", end: "2026-09-12" },
        },
      }),
    );
    await nextTick();
    await wrapper.get('[data-date="2026-09-29"]').trigger("click");
    expect(button(wrapper, "Apply").attributes("disabled")).toBeDefined();
    await wrapper.get('[data-date="2026-10-03"]').trigger("click");
    expect(button(wrapper, "Apply").attributes("disabled")).toBeUndefined();
    expect(wrapper.get('input[name="period[start]"]').attributes("value")).toBe(
      "2026-09-10",
    );
    await button(wrapper, "Apply").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      { start: "2026-09-29", end: "2026-10-03" },
    ]);
    expect(wrapper.get('input[name="period[start]"]').attributes("value")).toBe(
      "2026-09-29",
    );
    await wrapper.get('[data-date="2026-09-02"]').trigger("click");
    await button(wrapper, "Cancel").trigger("click");
    expect(wrapper.get('input[name="period[start]"]').attributes("value")).toBe(
      "2026-09-29",
    );
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(5);
  });
  it("keeps controlled values parent-owned when an auto-apply update is rejected", async () => {
    const wrapper = keep(
      mount(DatePicker, {
        props: {
          inline: true,
          shortcuts: false,
          name: "delivery",
          modelValue: "2026-09-10",
        },
      }),
    );
    await wrapper.get('[data-date="2026-09-20"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      "2026-09-20",
    ]);
    expect(wrapper.get('input[type="hidden"]').attributes("value")).toBe(
      "2026-09-10",
    );
    expect(
      wrapper.get('[data-date="2026-09-10"]').attributes("data-selected"),
    ).toBeDefined();
    expect(
      (wrapper.get('input[type="date"]').element as HTMLInputElement).value,
    ).toBe("2026-09-10");
    await wrapper.setProps({ modelValue: "2026-10-15" });
    expect(
      wrapper.get('[data-date="2026-10-15"]').attributes("data-selected"),
    ).toBeDefined();
    await button(wrapper, "Clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
    expect(wrapper.get('input[type="hidden"]').attributes("value")).toBe(
      "2026-10-15",
    );
  });
  it("validates typed ranges and custom shortcuts with the same disabled-day rules", async () => {
    const wrapper = keep(
      mount(DatePicker, {
        props: {
          mode: "range",
          inline: true,
          autoApply: false,
          startFrom: "2026-09-01",
          disabledDates: ["2026-09-15"],
          shortcuts: [
            {
              label: "Blocked",
              value: { start: "2026-09-10", end: "2026-09-20" },
            },
            {
              label: "Available",
              value: () => ({ start: "2026-09-17", end: "2026-09-18" }),
            },
          ],
        },
      }),
    );
    expect(button(wrapper, "Blocked").attributes("disabled")).toBeDefined();
    const inputs = wrapper.findAll('input[type="date"]');
    await inputs[0]!.setValue("2026-09-10");
    expect(button(wrapper, "Apply").attributes("disabled")).toBeDefined();
    await inputs[1]!.setValue("2026-09-20");
    expect(wrapper.get('[role="alert"]').text()).toBe(
      "Choose an available date or date range.",
    );
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await button(wrapper, "Available").trigger("click");
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    await button(wrapper, "Apply").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      { start: "2026-09-17", end: "2026-09-18" },
    ]);
  });
  it("resets uncontrolled form values, supports external form association and omits disabled values", async () => {
    const form = document.createElement("form");
    form.id = "delivery-form";
    document.body.append(form);
    const wrapper = keep(
      mount(DatePicker, {
        attachTo: document.body,
        props: {
          inline: true,
          name: "delivery",
          form: form.id,
          defaultValue: "2026-09-10",
          shortcuts: false,
        },
      }),
    );
    await wrapper.get('[data-date="2026-09-20"]').trigger("click");
    expect(new FormData(form).get("delivery")).toBe("2026-09-20");
    form.reset();
    await flushPromises();
    expect(new FormData(form).get("delivery")).toBe("2026-09-10");
    await wrapper.setProps({ disabled: true });
    expect(new FormData(form).has("delivery")).toBe(false);
  });
  it("respects prevented native form reset", async () => {
    const form = document.createElement("form");
    document.body.append(form);
    const wrapper = keep(
      mount(DatePicker, {
        attachTo: form,
        props: {
          inline: true,
          name: "delivery",
          defaultValue: "2026-09-10",
          shortcuts: false,
        },
      }),
    );
    form.addEventListener("reset", (event) => event.preventDefault());
    await wrapper.get('[data-date="2026-09-20"]').trigger("click");
    form.reset();
    await flushPromises();
    expect(new FormData(form).get("delivery")).toBe("2026-09-20");
  });
  it("opens its Reka dialog, cancels pending selection before Escape closes and returns focus", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const wrapper = keep(
      mount(DatePicker, {
        attachTo: document.body,
        props: { mode: "range", startFrom: "2026-09-01", shortcuts: false },
      }),
    );
    const trigger = wrapper.get("button");
    (trigger.element as HTMLButtonElement).focus();
    await trigger.trigger("click");
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(wrapper.getComponent(PopoverContent).props("collisionPadding")).toBe(
      16,
    );
    await wrapper.setProps({
      collisionPadding: { top: 16, right: 16, bottom: 80, left: 16 },
    });
    expect(
      wrapper.getComponent(PopoverContent).props("collisionPadding"),
    ).toEqual({
      top: 16,
      right: 16,
      bottom: 80,
      left: 16,
    });
    const day = document.querySelector<HTMLButtonElement>(
      '[data-date="2026-09-10"]',
    )!;
    day.click();
    await nextTick();
    day.focus();
    day.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    day.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
  });
});
