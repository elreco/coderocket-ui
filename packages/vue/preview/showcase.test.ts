// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import Showcase from "./showcase.vue";
import examples from "./examples.json";
const wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});
describe("native Vue component previews", () => {
  it("mounts all 48 interactive component previews without framework or runtime errors", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    expect(Object.keys(examples)).toHaveLength(48);
    for (const slug of Object.keys(examples)) {
      const wrapper = mount(Showcase, { props: { slug } });
      wrappers.push(wrapper);
      await nextTick();
      expect(wrapper.text(), slug).not.toContain("Component unavailable.");
      // A stable wrapper keeps the docs/Studio layout off the component root.
      // This matters for inline controls and layout-bearing roots like Calendar.
      expect(wrapper.find(".cr-demo > .cr-demo-content").exists(), slug).toBe(
        true,
      );
      expect(
        wrapper.get(".cr-demo-content").element.children.length,
        slug,
      ).toBeGreaterThan(0);
      wrapper.unmount();
      wrappers.pop();
    }
  });
  it("compiles all documented examples as actual Vue single-file components", () => {
    for (const [slug, source] of Object.entries(examples)) {
      const { descriptor, errors } = parse(source, {
        filename: `${slug}-example.vue`,
      });
      expect(errors, slug).toEqual([]);
      const script = compileScript(descriptor, { id: slug });
      const template = compileTemplate({
        source: descriptor.template!.content,
        filename: `${slug}-example.vue`,
        id: slug,
        compilerOptions: { bindingMetadata: script.bindings },
      });
      expect(template.errors, slug).toEqual([]);
      expect(script.content, slug).toContain("./components/ui/");
      expect(source, slug).not.toMatch(/react|useState|onClick=/);
    }
  });
  it("updates the Vue pagination and click feedback examples", async () => {
    const pagination = mount(Showcase, { props: { slug: "pagination" } });
    wrappers.push(pagination);
    await pagination.get('[aria-label="Next"]').trigger("click");
    expect(pagination.get('[aria-current="page"]').text()).toBe("3");
    const button = mount(Showcase, { props: { slug: "button" } });
    wrappers.push(button);
    await button.get("button").trigger("click");
    expect(button.get('[role="status"]').text()).toBe("Ready to continue.");
    expect(
      button
        .get('[role="status"]')
        .element.parentElement?.classList.contains("cr-demo"),
    ).toBe(true);
  });
});
