// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Button from "./components/button.vue";
import Input from "./components/input.vue";
import Textarea from "./components/textarea.vue";
import Checkbox from "./components/checkbox.vue";
import Switch from "./components/switch.vue";
import RadioGroup from "./components/radio-group.vue";
import ToggleGroup from "./components/toggle-group.vue";
import NumberField from "./components/number-field.vue";
import Slider from "./components/slider.vue";
import Select from "./components/select.vue";
import Combobox from "./components/combobox.vue";
import Field from "./components/field.vue";
import FileUpload from "./components/file-upload.vue";
import ThemeScope from "./components/theme-scope.vue";
import { validateUploadFile } from "./components/file-upload";

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
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = "";
});

describe("Vue form controls", () => {
  it("prevents loading button actions and exposes busy state", async () => {
    const onClick = vi.fn();
    const wrapper = render(Button, {
      props: { loading: true, onClick },
      slots: { default: "Save" },
    });
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.find(".cr-spinner").exists()).toBe(true);
    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("prevents a disabled slotted link button from navigating or firing its action", async () => {
    const onClick = vi.fn();
    const wrapper = render(Button, {
      props: { asChild: true, disabled: true },
      slots: {
        default: () => h("a", { href: "/settings", onClick }, "Settings"),
      },
    });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    wrapper.find("a").element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper.find("a").attributes("tabindex")).toBe("-1");
  });

  it("lets keyboard users leave a disabled link button without activating it", () => {
    const wrapper = render(Button, {
      props: { asChild: true, disabled: true },
      slots: { default: () => h("a", { href: "/settings" }, "Settings") },
    });
    const link = wrapper.get("a").element;
    for (const key of ["Tab", "Escape", "ArrowRight"]) {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it("announces a readonly radio group while keeping its value unchanged", async () => {
    const wrapper = render(RadioGroup, {
      props: {
        label: "Visibility",
        defaultValue: "private",
        readOnly: true,
        options: [
          { value: "private", label: "Private" },
          { value: "public", label: "Public" },
        ],
      },
    });
    expect(wrapper.get('[role="radiogroup"]').attributes("aria-readonly")).toBe(
      "true",
    );
    await wrapper.findAll('[role="radio"]')[1].trigger("click");
    expect(
      wrapper.findAll('[role="radio"]')[0].attributes("aria-checked"),
    ).toBe("true");
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("supports external form submission and reset for text controls", async () => {
    document.body.innerHTML = '<form id="external"></form>';
    const input = render(Input, {
      props: { name: "title", form: "external", defaultValue: "Original" },
    });
    const textarea = render(Textarea, {
      props: { name: "body", form: "external", defaultValue: "Message" },
    });
    await input.find("input").setValue("Updated");
    await textarea.find("textarea").setValue("New body");
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("title")).toBe("Updated");
    expect(new FormData(form).get("body")).toBe("New body");
    form.reset();
    await flushPromises();
    expect((input.element as HTMLInputElement).value).toBe("Original");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("Message");
  });

  it("links Field label, description, error and disabled state to its control", async () => {
    const wrapper = render(Field, {
      props: {
        label: "Email",
        description: "Work address",
        error: "Invalid email",
        disabled: true,
      },
      slots: { default: () => h(Input, { type: "email" }) },
    });
    const input = wrapper.find("input");
    expect(wrapper.find("label").attributes("for")).toBe(
      input.attributes("id"),
    );
    const ids = input.attributes("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids.every((id) => !!document.getElementById(id))).toBe(true);
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("disabled")).toBeDefined();
  });

  it("runs Field custom validation and clears errors after editing", async () => {
    const wrapper = render(Field, {
      props: {
        label: "Code",
        validate: (value: string) => (value === "ok" ? null : "Use ok"),
      },
      slots: { default: () => h(Input) },
    });
    await wrapper.find("input").setValue("bad");
    await wrapper.find("input").trigger("focusout");
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toBe("Use ok");
    await wrapper.find("input").setValue("ok");
    await wrapper.find("input").trigger("focusout");
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it("supports checked, indeterminate, disabled, required and reset semantics", async () => {
    document.body.innerHTML = '<form id="checks"></form>';
    const wrapper = render(Checkbox, {
      props: {
        label: "Accept",
        name: "accept",
        form: "checks",
        value: "yes",
        required: true,
      },
    });
    const form = document.querySelector("form")!;
    expect(form.checkValidity()).toBe(false);
    await wrapper.find('[role="checkbox"]').trigger("click");
    expect(wrapper.find('[role="checkbox"]').attributes("aria-checked")).toBe(
      "true",
    );
    expect(new FormData(form).get("accept")).toBe("yes");
    expect(form.checkValidity()).toBe(true);
    form.reset();
    await flushPromises();
    expect(wrapper.find('[role="checkbox"]').attributes("aria-checked")).toBe(
      "false",
    );
    await wrapper.setProps({ indeterminate: true });
    expect(wrapper.find('[role="checkbox"]').attributes("aria-checked")).toBe(
      "mixed",
    );
    await wrapper.setProps({ disabled: true });
    expect(new FormData(form).has("accept")).toBe(false);
  });

  it("supports controlled switch models without mutating the parent value", async () => {
    const wrapper = render(Switch, {
      props: {
        label: "Alerts",
        modelValue: false,
        "onUpdate:modelValue": vi.fn(),
      },
    });
    await wrapper.find('[role="switch"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
    expect(wrapper.find('[role="switch"]').attributes("aria-checked")).toBe(
      "false",
    );
    await wrapper.setProps({ modelValue: true });
    expect(
      wrapper.find('[role="switch"]').attributes("data-checked"),
    ).toBeDefined();
  });

  it("selects radio choices, skips disabled choices and submits one value", async () => {
    document.body.innerHTML = '<form id="radios"></form>';
    const wrapper = render(RadioGroup, {
      props: {
        label: "Plan",
        form: "radios",
        name: "plan",
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true },
          { value: "c", label: "C" },
        ],
      },
    });
    await wrapper.findAll('[role="radio"]')[1].trigger("click");
    expect(wrapper.emitted("value-change")).toBeUndefined();
    await wrapper.findAll('[role="radio"]')[2].trigger("click");
    expect(
      new FormData(document.querySelector("form")!).getAll("plan"),
    ).toEqual(["c"]);
  });

  it("keeps ToggleGroup array values in single and multiple modes", async () => {
    const wrapper = render(ToggleGroup, {
      props: {
        label: "Style",
        items: [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
        ],
      },
    });
    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual([["bold"]]);
    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual([["italic"]]);
    await wrapper.setProps({ multiple: true });
    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual([
      ["italic", "bold"],
    ]);
  });

  it("increments, clamps, formats and submits numeric values", async () => {
    document.body.innerHTML = '<form id="numbers"></form>';
    const wrapper = render(NumberField, {
      props: {
        label: "Amount",
        name: "amount",
        form: "numbers",
        defaultValue: 1.5,
        min: 0,
        max: 2,
        step: 0.5,
        locale: "de-DE",
      },
    });
    expect(
      (wrapper.find("input:not([aria-hidden])").element as HTMLInputElement)
        .value,
    ).toBe("1,5");
    await flushPromises();
    wrapper
      .find('button[aria-label="Increase Amount"]')
      .element.dispatchEvent(
        new MouseEvent("pointerdown", { button: 0, bubbles: true }),
      );
    await nextTick();
    await wrapper
      .find('button[aria-label="Increase Amount"]')
      .trigger("pointerup");
    expect(new FormData(document.querySelector("form")!).get("amount")).toBe(
      "2",
    );
    expect(
      wrapper
        .find('button[aria-label="Increase Amount"]')
        .attributes("disabled"),
    ).toBeDefined();
  });

  it("exposes all range slider thumbs and keyboard value commits", async () => {
    const wrapper = render(Slider, {
      props: {
        label: "Range",
        defaultValue: [20, 70],
        thumbLabels: ["Minimum", "Maximum"],
      },
    });
    expect(wrapper.findAll('[role="slider"]')).toHaveLength(2);
    const thumb = wrapper.findAll('[role="slider"]')[0];
    expect(thumb.attributes("aria-label")).toBe("Minimum");
    await thumb.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual([[21, 70]]);
    expect(wrapper.emitted("value-committed")?.at(-1)).toEqual([[21, 70]]);
  });

  it("opens Select inside ThemeScope and selects an option", async () => {
    const wrapper = render(ThemeScope, {
      slots: {
        default: () =>
          h(Select, {
            label: "Country",
            options: [
              { value: "gr", label: "Greece" },
              { value: "fr", label: "France" },
            ],
          }),
      },
    });
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const option = document.querySelector<HTMLElement>(
      '[role="option"][data-state="unchecked"]',
    );
    expect(option).not.toBeNull();
    expect(wrapper.element.contains(option)).toBe(true);
    option!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    await flushPromises();
    expect(wrapper.find('[role="combobox"]').text()).toContain("Greece");
  });

  it("filters Combobox results, selects and clears a value", async () => {
    const wrapper = render(Combobox, {
      props: {
        label: "Language",
        items: ["Vue", "React", "Svelte"],
        clearable: true,
      },
    });
    await wrapper.find('input[role="combobox"]').setValue("Vue");
    await flushPromises();
    const options = [
      ...document.querySelectorAll<HTMLElement>('[role="option"]'),
    ].filter((item) => item.style.display !== "none");
    expect(options.map((item) => item.textContent?.trim())).toEqual(["Vue"]);
    options[0].click();
    await flushPromises();
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual(["Vue"]);
    await wrapper.find('button[aria-label="Clear Language"]').trigger("click");
    expect(wrapper.emitted("value-change")?.at(-1)).toEqual([null]);
  });
});

describe("readonly controls and form validation regressions", () => {
  it("keeps readonly select/combobox values submittable without allowing edits", async () => {
    document.body.innerHTML = '<form id="readonly"></form>';
    const select = render(Select, {
      props: {
        label: "Regions",
        options: [
          { value: "fr", label: "France" },
          { value: "de", label: "Germany" },
        ],
        multiple: true,
        defaultValue: ["fr", "de"],
        name: "regions",
        form: "readonly",
        readOnly: true,
      },
    });
    const combobox = render(Combobox, {
      props: {
        label: "Country",
        items: ["France", "Germany"],
        value: "France",
        inputValue: "Fra",
        name: "country",
        form: "readonly",
        readOnly: true,
        clearable: true,
      },
    });
    await select
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowDown" });
    await combobox.find('button[aria-label="Open Country"]').trigger("click");
    await combobox.find('button[aria-label="Clear Country"]').trigger("click");
    await flushPromises();
    expect(select.find('[role="combobox"]').attributes("aria-readonly")).toBe(
      "true",
    );
    expect(select.find('[role="combobox"]').text()).toBe("France, Germany");
    expect(document.querySelector('[role="option"]')).toBeNull();
    expect(
      combobox.find('input[role="combobox"]').attributes("readonly"),
    ).toBeDefined();
    expect(
      (combobox.find('input[role="combobox"]').element as HTMLInputElement)
        .value,
    ).toBe("Fra");
    expect(combobox.emitted("value-change")).toBeUndefined();
    const data = new FormData(document.querySelector("form")!);
    expect(data.getAll("regions")).toEqual(["fr", "de"]);
    expect(data.get("country")).toBe("France");
  });

  it("runs on-change validation when a custom selection control changes", async () => {
    const validate = vi.fn((value: string) =>
      value ? "Leave this unchecked" : null,
    );
    const wrapper = render(Field, {
      props: { label: "Selection", validationMode: "onChange", validate },
      slots: {
        default: () =>
          h(Checkbox, { name: "selected", label: "Selected", value: "yes" }),
      },
    });
    await wrapper.find('[role="checkbox"]').trigger("click");
    await vi.waitFor(() =>
      expect(wrapper.find('[role="alert"]').text()).toBe(
        "Leave this unchecked",
      ),
    );
    expect(validate.mock.calls.at(-1)?.[0]).toBe("yes");
    await wrapper.find('[role="checkbox"]').trigger("click");
    await vi.waitFor(() => expect(validate.mock.calls.at(-1)?.[0]).toBe(""));
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it("validates every Field before submitting once and resets custom validity", async () => {
    let finish: ((result: null) => void) | undefined;
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const wrapper = render({
      render: () =>
        h("form", { onSubmit }, [
          h(
            Field,
            {
              label: "Code",
              validationMode: "onSubmit",
              validate: (value: string) => (value === "ok" ? null : "Use ok"),
            },
            { default: () => h(Input, { name: "code" }) },
          ),
          h(
            Field,
            {
              label: "Remote check",
              validationMode: "onSubmit",
              validate: () =>
                new Promise<null>((resolve) => {
                  finish = resolve;
                }),
            },
            {
              default: () =>
                h(Input, { name: "remote", defaultValue: "ready" }),
            },
          ),
        ]),
    });
    await flushPromises();
    await wrapper.find('input[name="code"]').setValue("bad");
    await wrapper.find("form").trigger("submit");
    finish?.(null);
    await flushPromises();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(wrapper.find('[role="alert"]').text()).toBe("Use ok");
    expect(
      (wrapper.find('input[name="code"]').element as HTMLInputElement).validity
        .customError,
    ).toBe(true);
    (wrapper.element as HTMLFormElement).reset();
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(
      (wrapper.find('input[name="code"]').element as HTMLInputElement).validity
        .customError,
    ).toBe(false);
    await wrapper.find('input[name="code"]').setValue("ok");
    await wrapper.find("form").trigger("submit");
    await wrapper.find("form").trigger("submit");
    expect(onSubmit).not.toHaveBeenCalled();
    finish?.(null);
    await flushPromises();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("Vue file upload", () => {
  const file = new File(["image"], "avatar.PNG", { type: "image/png" });
  async function choose(wrapper: VueWrapper, value = file) {
    Object.defineProperty(wrapper.find('input[type="file"]').element, "files", {
      configurable: true,
      value: [value],
    });
    await wrapper.find('input[type="file"]').trigger("change");
  }
  it("validates extensions, MIME wildcards and file size", () => {
    expect(validateUploadFile(file, ".png", 100)).toBeNull();
    expect(validateUploadFile(file, "image/*", 100)).toBeNull();
    expect(validateUploadFile(file, ".pdf", 100)).toBe(
      "This file type is not supported.",
    );
    expect(validateUploadFile(file, undefined, 1)).toBe(
      "Choose a file no larger than 1 KB.",
    );
  });
  it("reports selection/rejection and clears the native file input", async () => {
    const wrapper = render(FileUpload, { props: { accept: "image/*" } });
    await choose(wrapper);
    expect(wrapper.emitted("file-select")).toEqual([[file]]);
    await choose(
      wrapper,
      new File(["text"], "notes.txt", { type: "text/plain" }),
    );
    expect(wrapper.emitted("file-change")?.at(-1)).toEqual([null]);
    expect(wrapper.find('[role="alert"]').text()).toBe(
      "This file type is not supported.",
    );
  });
  it("cancels an in-flight upload and ignores its late completion", async () => {
    let resolve!: () => void;
    let signal!: AbortSignal;
    const onUpload = vi.fn(
      (
        _file: File,
        context: { signal: AbortSignal; onProgress: (percent: number) => void },
      ) => {
        signal = context.signal;
        context.onProgress(55);
        return new Promise<void>((done) => {
          resolve = done;
        });
      },
    );
    const wrapper = render(FileUpload, { props: { onUpload } });
    await choose(wrapper);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Upload")!
      .trigger("click");
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(
      wrapper.find('[role="progressbar"]').attributes("aria-valuenow"),
    ).toBe("55");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Cancel upload")!
      .trigger("click");
    expect(signal.aborted).toBe(true);
    resolve();
    await flushPromises();
    expect(wrapper.text()).not.toContain("Upload complete.");
    expect(wrapper.emitted("file-change")?.at(-1)).toEqual([null]);
  });
  it("resets selection with an external native form", async () => {
    document.body.innerHTML = '<form id="upload"></form>';
    const wrapper = render(FileUpload, {
      props: { form: "upload", name: "asset" },
    });
    await choose(wrapper);
    document.querySelector("form")!.reset();
    await flushPromises();
    expect(wrapper.text()).not.toContain("avatar.PNG");
    expect(wrapper.emitted("file-change")?.at(-1)).toEqual([null]);
  });
});
