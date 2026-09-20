// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import CompositionPreview from "./composition.vue";
import type {
  Composition,
  CompositionNode,
} from "./components/composition-types";
const cleanups: (() => void)[] = [];
const node = (
  id: string,
  kind: CompositionNode["kind"],
  extra: Partial<CompositionNode> = {},
): CompositionNode => ({
  id,
  parent: "root",
  kind,
  text: id,
  description: "",
  ...extra,
});
function composition(nodes: CompositionNode[]): Composition {
  return {
    schemaVersion: 1,
    name: "Contact",
    slug: "contact-custom",
    kind: "block",
    description: "Contact form",
    nodes,
  };
}
function render(
  value: Composition,
  onAction?: (
    action: string,
    values?: Record<string, FormDataEntryValue>,
  ) => void | Promise<void>,
) {
  const wrapper = mount(CompositionPreview, {
    props: { composition: value, onAction },
    attachTo: document.body,
  });
  cleanups.push(() => wrapper.unmount());
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
});
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  document.body.innerHTML = "";
});

describe("Vue composition preview", () => {
  it("renders all eighteen supported node kinds with safe text and native controls", async () => {
    const kinds: CompositionNode["kind"][] = [
      "row",
      "grid",
      "card",
      "form",
      "heading",
      "text",
      "button",
      "badge",
      "separator",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "select",
      "progress",
      "avatar",
      "file-upload",
    ];
    const wrapper = render(
      composition([
        node("root", "stack", { parent: null }),
        ...kinds.map((kind, index) =>
          node(`item-${index}`, kind, {
            name: `field-${index}`,
            action: `action-${index}`,
            options: [{ value: "a", label: "Alpha" }],
            text: kind === "text" ? "<script>alert(1)</script>" : kind,
          }),
        ),
      ]),
    );
    await flushPromises();
    expect(wrapper.findAll("form")).toHaveLength(1);
    expect(
      wrapper.find('input[type="file"]').attributes("multiple"),
    ).toBeDefined();
    expect(wrapper.findAll("input[name]").length).toBeGreaterThanOrEqual(4);
    expect(wrapper.find("script").exists()).toBe(false);
    expect(wrapper.text()).toContain("<script>alert(1)</script>");
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true);
  });

  it("collects native form data and awaits actions while preventing duplicate submissions", async () => {
    let done!: () => void;
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          done = resolve;
        }),
    );
    const wrapper = render(
      composition([
        node("root", "stack", { parent: null }),
        node("contact", "form", { action: "send" }),
        node("email", "input", {
          parent: "contact",
          name: "email",
          inputType: "email",
          required: true,
        }),
        node("subscribe", "checkbox", { parent: "contact", name: "subscribe" }),
        node("submit", "button", {
          parent: "contact",
          action: "submit",
          text: "Send",
        }),
      ]),
      onAction,
    );
    await wrapper.find('input[type="email"]').setValue("hello@example.com");
    await wrapper.find('[role="checkbox"]').trigger("click");
    await wrapper.find("form").trigger("submit");
    expect(onAction).toHaveBeenCalledWith("send", {
      email: "hello@example.com",
      subscribe: "on",
    });
    expect(
      wrapper.find('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
    expect(wrapper.find('[role="status"]').text()).toBe("Working…");
    await wrapper.find("form").trigger("submit");
    expect(onAction).toHaveBeenCalledTimes(1);
    done();
    await flushPromises();
    expect(
      wrapper.find('button[type="submit"]').attributes("disabled"),
    ).toBeUndefined();
  });

  it("reports preview actions and rejected callbacks", async () => {
    const value = composition([
      node("root", "stack", { parent: null }),
      node("run", "button", { action: "run-task" }),
    ]);
    const wrapper = render(value);
    await wrapper.find("button").trigger("click");
    expect(wrapper.find('[role="status"]').text()).toContain(
      "Preview action: run-task.",
    );
    await wrapper.setProps({
      onAction: async () => {
        throw new Error("offline");
      },
    });
    await wrapper.find("button").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="status"]').text()).toBe(
      "The action could not be completed. Please try again.",
    );
  });

  it("passes locally selected files to the explicit application callback", async () => {
    const onAction = vi.fn();
    const wrapper = render(
      composition([
        node("root", "stack", { parent: null }),
        node("upload", "file-upload", { name: "documents", action: "attach" }),
      ]),
      onAction,
    );
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    Object.defineProperty(wrapper.find('input[type="file"]').element, "files", {
      configurable: true,
      value: [file],
    });
    await wrapper.find('input[type="file"]').trigger("change");
    expect(onAction).toHaveBeenCalledWith("attach", { "0": file });
    expect(wrapper.find("li").text()).toBe("hello.txt · 1 KB");
  });
});
