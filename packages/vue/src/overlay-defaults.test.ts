// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { h } from "vue";
import Dialog from "./components/dialog.vue";
import AlertDialog from "./components/alert-dialog.vue";
import Drawer from "./components/drawer.vue";
import Sheet from "./components/sheet.vue";

const overlays = [
  ["Dialog", Dialog],
  ["AlertDialog", AlertDialog],
  ["Drawer", Drawer],
  ["Sheet", Sheet],
] as const;
const wrappers: VueWrapper[] = [];
function render(
  component: Parameters<typeof mount>[0],
  options: Record<string, unknown>,
): VueWrapper {
  const wrapper = mount(component, { attachTo: document.body, ...options });
  wrappers.push(wrapper);
  return wrapper;
}
async function settle() {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 20));
  await flushPromises();
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
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await settle();
  document.body.innerHTML = "";
});

describe.each(overlays)("%s omitted overlay props", (name, component) => {
  it("provides the default close action, moves focus inside and restores the trigger", async () => {
    const wrapper = render(component, {
      props: { title: "Edit settings", description: "Adjust your workspace" },
      slots: {
        trigger: () => h("button", { id: "open-settings" }, "Open settings"),
        default: () => h("input", { "aria-label": "Workspace name" }),
      },
    });
    const trigger = wrapper.get("#open-settings");
    (trigger.element as HTMLElement).focus();
    await trigger.trigger("click");
    await settle();
    const popup = document.querySelector(".cr-modal")!;
    expect(popup).not.toBeNull();
    expect(popup.contains(document.activeElement)).toBe(true);
    const close = popup.querySelector<HTMLButtonElement>(
      ".cr-modal-footer button",
    );
    expect(close?.textContent).toBe("Close");
    close!.click();
    await settle();
    expect(document.querySelector(".cr-modal")).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
  });

  it("does not insert an empty trigger for a controlled overlay", async () => {
    const wrapper = render(component, {
      props: {
        title: "Settings",
        description: "Workspace settings",
        open: true,
      },
    });
    await settle();
    expect(wrapper.find('[aria-haspopup="dialog"]').exists()).toBe(false);
    expect(document.querySelector(".cr-modal-footer button")?.textContent).toBe(
      "Close",
    );
  });

  it("keeps explicit null and false footer content distinct from omission", async () => {
    const wrapper = render(component, {
      props: {
        title: "Settings",
        description: "Workspace settings",
        open: true,
        footer: null,
      },
    });
    await settle();
    expect(document.querySelector(".cr-modal-footer")).toBeNull();
    await wrapper.setProps({ footer: false });
    expect(document.querySelector(".cr-modal-footer")).not.toBeNull();
    expect(document.querySelector(".cr-modal-footer")?.textContent).toBe("");
    await wrapper.setProps({ footer: undefined, closeLabel: "Done" });
    expect(document.querySelector(".cr-modal-footer button")?.textContent).toBe(
      "Done",
    );
  });

  it("forwards explicit focus suppression and honors a supplied return target", async () => {
    const returnTarget = document.createElement("button");
    returnTarget.textContent = "Return here";
    document.body.append(returnTarget);
    const wrapper = render(component, {
      props: {
        title: "Settings",
        description: "Workspace settings",
        initialFocus: false,
        finalFocus: () => returnTarget,
      },
      slots: {
        trigger: () => h("button", { id: "open-settings" }, "Open settings"),
        default: () => h("input", { "aria-label": "Workspace name" }),
      },
    });
    const trigger = wrapper.get("#open-settings");
    (trigger.element as HTMLElement).focus();
    await trigger.trigger("click");
    await settle();
    expect(
      (wrapper.emitted("open-auto-focus")?.[0]?.[0] as Event).defaultPrevented,
    ).toBe(true);
    // Reka AlertDialog additionally focuses its safe Cancel action.
    if (name !== "AlertDialog")
      expect(document.activeElement).toBe(trigger.element);
    document.querySelector<HTMLButtonElement>(".cr-modal-close")!.click();
    await settle();
    expect(document.activeElement).toBe(returnTarget);
  });
});
