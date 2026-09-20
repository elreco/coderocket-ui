// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { h, nextTick, defineComponent } from "vue";
import { readFileSync } from "node:fs";
const cssFile = "./display.css";
const displayCss = readFileSync(new URL(cssFile, import.meta.url), "utf8");
import Accordion from "./components/accordion.vue";
import Tabs from "./components/tabs.vue";
import Collapsible from "./components/collapsible.vue";
import Dialog from "./components/dialog.vue";
import AlertDialog from "./components/alert-dialog.vue";
import ContextMenu from "./components/context-menu.vue";
import Dropdown from "./components/dropdown.vue";
import Popover from "./components/popover.vue";
import Command from "./components/command.vue";
import DataTable from "./components/data-table.vue";
import Table from "./components/table.vue";
import Pagination from "./components/pagination.vue";
import Sidebar from "./components/sidebar.vue";
import Progress from "./components/progress.vue";
import ToastProvider from "./components/toast-provider.vue";
import { createToastManager, useToast } from "./components/toast-manager";
const wrappers: VueWrapper[] = [];
function render(
  component: Parameters<typeof mount>[0],
  options: Record<string, unknown> = {},
): VueWrapper {
  const wrapper = mount(component, { attachTo: document.body, ...options });
  wrappers.push(wrapper);
  return wrapper;
}
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  if (!globalThis.PointerEvent) vi.stubGlobal("PointerEvent", MouseEvent);
});
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = "";
  vi.useRealTimers();
});
const items = [
  { value: "one", title: "First", label: "First", content: "First panel" },
  { value: "two", title: "Second", label: "Second", content: "Second panel" },
  {
    value: "locked",
    title: "Locked",
    label: "Locked",
    content: "Locked panel",
    disabled: true,
  },
];
describe("Vue display controls", () => {
  it("scopes popup adapters to Reka without changing React overlays", () => {
    const style = document.createElement("style");
    style.textContent = displayCss;
    document.head.append(style);
    const fixture = document.createElement("div");
    fixture.innerHTML = `<div class="cr-popup" data-side="bottom" data-react></div><div data-reka-popper-content-wrapper style="--reka-popper-available-width: 400px"><div class="cr-popup" data-side="bottom" data-vue></div></div><div class="cr-menu-item" data-disabled data-react-item></div><div class="cr-menu-item" data-disabled data-reka-collection-item data-vue-item></div>`;
    document.body.append(fixture);
    try {
      // JSDOM does not resolve inherited custom properties. Match the parsed
      // browser CSS rules against the actual React and Reka DOM shapes.
      const rules = Array.from(style.sheet!.cssRules).filter(
        (rule): rule is CSSStyleRule => "selectorText" in rule,
      );
      const declarationsFor = (selector: string, property: string) =>
        rules
          .filter((rule) =>
            fixture.querySelector(selector)!.matches(rule.selectorText),
          )
          .map((rule) => rule.style.getPropertyValue(property))
          .filter(Boolean);
      expect(declarationsFor("[data-react]", "--available-width")).toEqual([]);
      expect(declarationsFor("[data-vue]", "--available-width")).toEqual([
        "var(--reka-popper-available-width)",
      ]);
      expect(declarationsFor("[data-react-item]", "opacity")).toEqual([]);
      expect(declarationsFor("[data-vue-item]", "opacity")).toEqual(["0.5"]);
    } finally {
      fixture.remove();
      style.remove();
    }
  });
  it("supports single accordion toggling, retained panels, and disabled entries", async () => {
    const wrapper = render(Accordion, { props: { items, keepMounted: true } });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["one"]]);
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("true");
    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["two"]]);
    expect(
      (wrapper.findAll(".cr-accordion-panel")[0].element as HTMLElement).style
        .display,
    ).toBe("none");
    expect(wrapper.findAll("button")[2].attributes("disabled")).toBeDefined();
  });
  it("keeps a controlled multiple accordion authoritative", async () => {
    const wrapper = render(Accordion, {
      props: { items, multiple: true, modelValue: ["one"] },
    });
    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      ["one", "two"],
    ]);
    expect(wrapper.findAll("button")[1].attributes("aria-expanded")).toBe(
      "false",
    );
    await wrapper.setProps({ modelValue: ["one", "two"] });
    expect(wrapper.findAll("button")[1].attributes("aria-expanded")).toBe(
      "true",
    );
  });
  it("provides manual keyboard tabs and disabled roving focus", async () => {
    const wrapper = render(Tabs, { props: { label: "Sections", items } });
    await flushPromises();
    const first = wrapper.findAll('[role="tab"]')[0];
    (first.element as HTMLElement).focus();
    await first.trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    expect(document.activeElement?.textContent).toBe("Second");
    expect(first.attributes("aria-selected")).toBe("true");
    await wrapper
      .findAll('[role="tab"]')[1]
      .trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual(["two"]);
    expect(wrapper.find('[role="tabpanel"][data-state="active"]').text()).toBe(
      "Second panel",
    );
  });
  it("keeps controlled collapsible closed until the parent updates it", async () => {
    const wrapper = render(Collapsible, {
      props: { title: "Details", open: false },
      slots: { default: "Detail text" },
    });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("update:open")).toEqual([[true]]);
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(".cr-collapsible-panel").text()).toBe("");
  });
  it("uses a single custom trigger, labelled dialog, Escape close, and restores focus", async () => {
    const wrapper = render(Dialog, {
      props: { title: "Edit profile", description: "Update your name" },
      slots: {
        trigger: () => h("button", { id: "open-profile" }, "Edit"),
        default: () => h("input", { "aria-label": "Name" }),
      },
    });
    expect(wrapper.findAll("button")).toHaveLength(1);
    const trigger = wrapper.get("button");
    (trigger.element as HTMLElement).focus();
    await trigger.trigger("click");
    await flushPromises();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(
      document.getElementById(dialog.getAttribute("aria-labelledby")!)
        ?.textContent,
    ).toBe("Edit profile");
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Update your name");
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flushPromises();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
    expect(document.activeElement?.id).toBe("open-profile");
  });
  it("keeps a controlled alert dialog open after requesting dismissal", async () => {
    const wrapper = render(AlertDialog, {
      props: {
        title: "Delete item",
        description: "This removes the item.",
        open: true,
      },
      slots: { default: "Confirm removal" },
    });
    await flushPromises();
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
    (
      document.querySelector('[aria-label="Close alert"]') as HTMLButtonElement
    ).click();
    await nextTick();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  });
  it("renders linked dropdown actions and respects disabled state", async () => {
    const select = vi.fn();
    render(Dropdown, {
      props: {
        open: true,
        items: [
          { label: "Docs", href: "#docs", onSelect: select },
          { label: "Locked", href: "#locked", disabled: true },
        ],
      },
      slots: { trigger: () => h("button", {}, "Actions") },
    });
    await flushPromises();
    expect(document.querySelectorAll("button button")).toHaveLength(0);
    const actions = document.querySelectorAll('[role="menuitem"]');
    expect(actions[0].getAttribute("href")).toBe("#docs");
    expect(actions[1].getAttribute("aria-disabled")).toBe("true");
    (actions[0] as HTMLElement).click();
    await nextTick();
    expect(select).toHaveBeenCalledOnce();
  });
  it("opens context actions from the keyboard and honors controlled open state", async () => {
    const wrapper = render(ContextMenu, {
      props: { items: [{ label: "Copy" }], open: false },
      slots: { default: "File" },
    });
    await wrapper
      .get(".cr-context-trigger")
      .trigger("keydown", { key: "F10", shiftKey: true });
    await flushPromises();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([true]);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await wrapper.setProps({ open: true });
    await flushPromises();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });
  it("supports programmatically opened popovers without a trigger", async () => {
    const wrapper = render(Popover, {
      props: { open: true, title: "Details" },
      slots: { default: "Saved information" },
    });
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      "Saved information",
    );
    (
      document.querySelector('[aria-label="Close popover"]') as HTMLElement
    ).click();
    await nextTick();
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });
  it("filters commands and selects an enabled result", async () => {
    const action = vi.fn();
    const wrapper = render(Command, {
      props: {
        defaultOpen: true,
        items: [
          { value: "save", label: "Save file", onSelect: action },
          { value: "remove", label: "Remove file", disabled: true },
        ],
      },
    });
    await flushPromises();
    const input = document.querySelector(
      '[role="combobox"]',
    ) as HTMLInputElement;
    input.value = "Save";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    const results = document.querySelectorAll('[role="option"]');
    expect(results).toHaveLength(1);
    (results[0] as HTMLElement).click();
    await flushPromises();
    expect(action).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
  });
  it("keeps command search, keyboard selection, and Escape in one dialog focus scope", async () => {
    const action = vi.fn();
    const blocked = vi.fn();
    const wrapper = render(Command, {
      props: {
        items: [
          {
            value: "locked",
            label: "Locked",
            disabled: true,
            onSelect: blocked,
          },
          { value: "save", label: "Save file", onSelect: action },
        ],
      },
    });
    const trigger = wrapper.get("button");
    (trigger.element as HTMLElement).focus();
    await trigger.trigger("click");
    await flushPromises();
    let input = document.querySelector('[role="combobox"]') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(
      document
        .getElementById(input.getAttribute("aria-controls")!)
        ?.getAttribute("role"),
    ).toBe("listbox");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
    expect(document.activeElement).toBe(trigger.element);

    await trigger.trigger("click");
    await flushPromises();
    input = document.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    await nextTick();
    expect(
      document.getElementById(input.getAttribute("aria-activedescendant")!)
        ?.textContent,
    ).toBe("Save file");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    await flushPromises();
    expect(action).toHaveBeenCalledOnce();
    expect(blocked).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")?.at(-1)?.[0]).toMatchObject({
      value: "save",
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
  });
  it("announces empty command results and respects controlled dismissal", async () => {
    const wrapper = render(Command, {
      props: {
        open: true,
        items: [{ value: "save", label: "Save" }],
        emptyMessage: "No commands found",
      },
    });
    await flushPromises();
    const input = document.querySelector(
      '[role="combobox"]',
    ) as HTMLInputElement;
    input.value = "Missing";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
    expect(document.querySelector('[role="status"]')?.textContent).toBe(
      "No commands found",
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flushPromises();
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    await wrapper.setProps({ open: false });
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
  it("sorts numbers, paginates, filters and renders custom cells without mutating rows", async () => {
    const rows = [
      { id: 1, name: "Zed", amount: 20 },
      { id: 2, name: "Ada", amount: 3 },
      { id: 3, name: "Lin", amount: 100 },
    ];
    const wrapper = render(DataTable, {
      props: {
        caption: "Accounts",
        rows,
        columns: [
          {
            key: "name",
            label: "Name",
            render: (value: unknown) => h("strong", String(value)),
          },
          { key: "amount", label: "Amount" },
        ],
        pageSize: 2,
      },
    });
    await wrapper
      .get('[aria-label="Sort by Amount, ascending"]')
      .trigger("click");
    expect(wrapper.findAll("tbody tr")[0].text()).toBe("Ada3");
    expect(rows[0].name).toBe("Zed");
    await wrapper.get('[aria-label="Next"]').trigger("click");
    expect(wrapper.get("tbody").text()).toBe("Lin100");
    await wrapper.get("input").setValue("Zed");
    expect(wrapper.get("tbody strong").text()).toBe("Zed");
    expect(wrapper.get('[role="status"]').text()).toBe("1–1 of 1 records");
    await wrapper.setProps({ loading: true });
    expect(wrapper.get("table").attributes("aria-busy")).toBe("true");
    expect(wrapper.get("tbody").text()).toBe("Loading records…");
  });
  it("emits controlled table query/sort/page changes without altering controlled values", async () => {
    const wrapper = render(DataTable, {
      props: {
        caption: "People",
        columns: [{ key: "name", label: "Name" }],
        rows: [{ name: "Ada" }, { name: "Zed" }],
        query: "",
        page: 1,
        sort: null,
      },
    });
    await wrapper.get("input").setValue("Ada");
    expect(wrapper.emitted("query-change")).toEqual([["Ada"]]);
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    await wrapper
      .get('[aria-label="Sort by Name, ascending"]')
      .trigger("click");
    expect(wrapper.emitted("sort-change")).toEqual([
      [{ key: "name", direction: 1 }],
    ]);
    expect(wrapper.get("th").attributes("aria-sort")).toBeUndefined();
  });
  it("provides table loading, empty states and accessible overflow", async () => {
    const wrapper = render(Table, {
      props: {
        caption: "Events",
        columns: ["Name"],
        rows: [],
        emptyMessage: "Nothing yet",
      },
    });
    expect(wrapper.get('[role="region"]').attributes("tabindex")).toBe("0");
    expect(wrapper.get("tbody").text()).toBe("Nothing yet");
    await wrapper.setProps({ loading: true });
    expect(wrapper.get("tbody").text()).toBe("Loading records…");
  });
  it("bounds invalid pagination and preserves collapsed sidebar names", async () => {
    const pagination = render(Pagination, {
      props: { page: 99, totalPages: 3 },
    });
    expect(pagination.get('[aria-current="page"]').text()).toBe("3");
    expect(
      pagination.get('[aria-label="Next"]').attributes("disabled"),
    ).toBeDefined();
    const sidebar = render(Sidebar, {
      props: {
        brand: "Company",
        items: [{ label: "Home", href: "#home", active: true }],
      },
    });
    await sidebar.get("button").trigger("click");
    expect(sidebar.get("a").attributes("aria-label")).toBe("Home");
    expect(sidebar.get("a").attributes("aria-current")).toBe("page");
  });
  it("renders indeterminate progress without an incorrect percentage", () => {
    const wrapper = render(Progress, {
      props: { label: "Uploading", value: null },
    });
    expect(
      wrapper.get('[role="progressbar"]').attributes("aria-valuenow"),
    ).toBeUndefined();
    expect(wrapper.text()).not.toContain("%");
  });
});
describe("Vue toast manager", () => {
  it("supports external add/upsert/update/close lifecycle callbacks", async () => {
    vi.useFakeTimers();
    const manager = createToastManager();
    const close = vi.fn(),
      remove = vi.fn();
    const id = manager.add({
      id: "saved",
      title: "Saving",
      onClose: close,
      onRemove: remove,
    });
    manager.add({ id, title: "Saved" });
    expect(manager.toasts).toHaveLength(1);
    manager.update(id, (previous) => ({
      description: previous.title === "Saved" ? "Complete" : "Pending",
    }));
    expect(manager.toasts[0].description).toBe("Complete");
    manager.close(id);
    manager.close(id);
    expect(close).toHaveBeenCalledOnce();
    expect(manager.toasts[0].open).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect(remove).toHaveBeenCalledOnce();
    expect(manager.toasts).toHaveLength(0);
  });
  it("tracks promises and preserves rejection", async () => {
    const manager = createToastManager();
    const result = manager.promise(Promise.resolve(42), {
      loading: "Loading",
      success: (value) => `Saved ${value}`,
      error: "Failed",
    });
    expect(manager.toasts[0].timeout).toBe(0);
    expect(await result).toBe(42);
    expect(manager.toasts[0].title).toBe("Saved 42");
    await expect(
      manager.promise(Promise.reject(new Error("Offline")), {
        loading: "Loading",
        success: "Saved",
        error: (error) => (error as Error).message,
      }),
    ).rejects.toThrow("Offline");
    expect(manager.toasts.at(-1)?.title).toBe("Offline");
  });
  it("uses an external manager and exposes the same manager to descendants", async () => {
    const manager = createToastManager();
    const Child = defineComponent({
      setup() {
        const toast = useToast(); // eslint-disable-line react-hooks/rules-of-hooks -- This is a Vue composable called inside Vue setup.
        return () =>
          h(
            "button",
            {
              onClick: () =>
                toast.add({ title: "Saved from child", timeout: 0 }),
            },
            "Save",
          );
      },
    });
    const wrapper = render(ToastProvider, {
      props: { toastManager: manager },
      slots: { default: () => h(Child) },
    });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(document.querySelector(".cr-toast-title")?.textContent).toBe(
      "Saved from child",
    );
    manager.update(manager.toasts[0].id, { title: "Updated externally" });
    await flushPromises();
    expect(document.querySelector(".cr-toast-title")?.textContent).toBe(
      "Updated externally",
    );
    (
      document.querySelector(
        '[aria-label="Dismiss notification"]',
      ) as HTMLElement
    ).click();
    await nextTick();
    expect(manager.toasts[0].open).toBe(false);
  });
});
