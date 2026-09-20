import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Form } from "@base-ui/react/form";
import { Button } from "./components/button";
import { Alert } from "./components/alert";
import { Input } from "./components/input";
import { Field } from "./components/field";
import { Textarea } from "./components/textarea";
import { Slider } from "./components/slider";
import { NumberField } from "./components/number-field";
import { Progress } from "./components/progress";
import { ToggleGroup } from "./components/toggle-group";
import { FileUpload, validateUploadFile } from "./components/file-upload";
import { Select } from "./components/select";
import { Combobox } from "./components/combobox";
import { Checkbox } from "./components/checkbox";
import { RadioGroup } from "./components/radio-group";
import { Switch } from "./components/switch";

describe("form control contracts", () => {
  it("shows server validation errors from the form without duplicating error props on Field", () => {
    const html = renderToStaticMarkup(
      createElement(Form, {
        errors: { email: "This email is already in use." },
        children: createElement(Field, {
          label: "Email",
          name: "email",
          children: createElement(Input, { type: "email" }),
        }),
      }),
    );
    expect(html).toContain("This email is already in use.");
    expect(html).toContain('class="cr-field-error"');
  });

  it("keeps pending actions disabled and retains their accessible name", () => {
    const html = renderToStaticMarkup(
      createElement(Button, { loading: true, children: "Save changes" }),
    );
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-busy="true"/);
    expect(html).toContain("Save changes");
    expect(html).toContain('aria-hidden="true"');
  });

  it("lets selects join an external form, render multiple values and expose error descriptions", () => {
    const html = renderToStaticMarkup(
      createElement(Select<true>, {
        label: "Regions",
        name: "regions",
        form: "settings",
        id: "regions",
        multiple: true,
        defaultValue: ["fr", "de"],
        readOnly: true,
        options: [
          { value: "fr", label: "France" },
          { value: "de", label: "Germany" },
        ],
        className: "region-select",
        triggerProps: {
          "aria-describedby": "regions-help",
          "aria-invalid": true,
        },
      }),
    );
    expect(html).toContain('form="settings"');
    expect(html).toContain('name="regions"');
    expect(html).toContain('value="fr"');
    expect(html).toContain('value="de"');
    expect(html).toContain("France, Germany");
    expect(html).toContain('aria-readonly="true"');
    expect(html).toContain('aria-describedby="regions-help"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("gives combobox search its own controlled value and forwards accessible form settings", () => {
    const html = renderToStaticMarkup(
      createElement(Combobox, {
        label: "Country",
        items: ["France", "Germany"],
        name: "country",
        form: "settings",
        id: "country",
        value: "France",
        inputValue: "Fra",
        readOnly: true,
        inputProps: { "aria-describedby": "country-help" },
      }),
    );
    expect(html).toContain('value="Fra"');
    expect(html).toContain('value="France"');
    expect(html).toContain('readonly=""');
    expect(html).toContain('aria-describedby="country-help"');
    expect(html).toContain('form="settings"');
    expect(html).toContain('name="country"');
  });

  it("preserves disabled state and native form values on selection controls", () => {
    for (const component of [
      createElement(Checkbox, {
        label: "Accept terms",
        name: "terms",
        checked: true,
        disabled: true,
      }),
      createElement(Switch, {
        label: "Notifications",
        name: "notifications",
        checked: true,
        disabled: true,
      }),
    ]) {
      const html = renderToStaticMarkup(component);
      expect(html).toContain('checked=""');
      expect(html).toMatch(/<input[^>]*disabled=""/);
    }
    const html = renderToStaticMarkup(
      createElement(RadioGroup, {
        label: "Plan",
        name: "plan",
        value: "pro",
        disabled: true,
        options: [
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
        ],
      }),
    );
    expect(html.match(/<input[^>]*disabled=""/g)).toHaveLength(2);
    expect(html).toContain('value="pro"');
    expect(html).toContain('checked=""');
  });

  it("renders every range thumb with its value and distinct accessible name", () => {
    const html = renderToStaticMarkup(
      createElement(Slider, {
        label: "Price range",
        value: [20, 80],
        thumbLabels: ["Minimum price", "Maximum price"],
        min: 0,
        max: 100,
      }),
    );
    expect(html.match(/type="range"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Minimum price"');
    expect(html).toContain('aria-label="Maximum price"');
    expect(html).toContain('value="20"');
    expect(html).toContain('value="80"');
  });

  it("preserves a controlled toggle group selection and disabled items", () => {
    const html = renderToStaticMarkup(
      createElement(ToggleGroup, {
        label: "Alignment",
        value: ["left"],
        items: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right", disabled: true },
        ],
      }),
    );
    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>Left<\/button>/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Right<\/button>/);
  });

  it("associates NumberField's visible label and forwards native form behavior", () => {
    const html = renderToStaticMarkup(
      createElement(NumberField, {
        label: "Team size",
        id: "team-size",
        name: "seats",
        defaultValue: 4,
        disabled: true,
        required: true,
      }),
    );
    expect(html).toContain('<label for="team-size"');
    expect(html).toMatch(/<input[^>]*id="team-size"[^>]*disabled=""/);
    expect(html).toContain('name="seats"');
    expect(html).toContain('required=""');
  });

  it("lets Field own the disabled state of a controlled textarea", () => {
    const html = renderToStaticMarkup(
      createElement(Field, {
        label: "Description",
        disabled: true,
        children: createElement(Textarea, {
          id: "description",
          value: "Saved description",
          name: "description",
          onChange: () => {},
        }),
      }),
    );
    const textareaId = html.match(/<textarea[^>]*id="([^"]+)"/)?.[1];
    expect(textareaId).toBeTruthy();
    expect(html).toContain(`for="${textareaId}"`);
    expect(html).toMatch(
      /<textarea[^>]*disabled=""[^>]*>Saved description<\/textarea>/,
    );
    expect(html).toContain('name="description"');
  });

  it("allows a polite alert status without forcing assertive announcements", () => {
    const html = renderToStaticMarkup(
      createElement(Alert, { role: "status", children: "Saved" }),
    );
    expect(html).toContain('role="status"');
    expect(html).not.toContain('role="alert"');
  });
});

describe("upload validation", () => {
  it("supports native form submission and constraint validation with an explicit label target", () => {
    const html = renderToStaticMarkup(
      createElement(FileUpload, {
        id: "attachment",
        name: "attachment",
        form: "message",
        required: true,
        disabled: true,
      }),
    );
    expect(html).toContain('for="attachment"');
    expect(html).toContain('name="attachment"');
    expect(html).toContain('form="message"');
    expect(html).toContain('required=""');
    expect(html).toContain('disabled=""');
  });
  it("describes sub-megabyte upload limits without rounding down to zero", () => {
    const html = renderToStaticMarkup(
      createElement(FileUpload, { maxBytes: 500 * 1024 }),
    );
    expect(html).toContain("Up to 500 KB.");
    expect(html).not.toContain("0 MB");
  });
  it("accepts case-insensitive extensions and MIME wildcards", () => {
    expect(
      validateUploadFile(
        { name: "DOCUMENT.PDF", size: 512, type: "application/pdf" },
        ".pdf, image/*",
        1024,
      ),
    ).toBeNull();
    expect(
      validateUploadFile(
        { name: "photo.png", size: 512, type: "IMAGE/PNG" },
        "image/*",
        1024,
      ),
    ).toBeNull();
    expect(
      validateUploadFile(
        { name: "document.txt", size: 512, type: "text/plain" },
        "application/pdf",
        1024,
      ),
    ).toBe("This file type is not supported.");
  });
  it("allows an exact size limit, reports small limits, and ignores empty accept entries", () => {
    expect(
      validateUploadFile(
        { name: "document.txt", size: 1024, type: "text/plain" },
        " , ",
        1024,
      ),
    ).toBeNull();
    expect(
      validateUploadFile(
        { name: "document.txt", size: 1025, type: "text/plain" },
        undefined,
        1024,
      ),
    ).toBe("Choose a file no larger than 1 KB.");
  });
});

describe("deterministic numeric formatting across server and browser", () => {
  it("keeps default formatting English even when the runtime defaults to French", () => {
    const NativeNumberFormat = Intl.NumberFormat;
    const formatter = vi
      .spyOn(Intl, "NumberFormat")
      .mockImplementation(function (locales, options) {
        return new NativeNumberFormat(locales ?? "fr-FR", options);
      } as typeof Intl.NumberFormat);
    try {
      const format = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      const slider = renderToStaticMarkup(
        createElement(Slider, { label: "Spacing", defaultValue: 1.5, format }),
      );
      const number = renderToStaticMarkup(
        createElement(NumberField, {
          label: "Rate",
          defaultValue: 1.5,
          format,
        }),
      );
      const progress = renderToStaticMarkup(
        createElement(Progress, { label: "Complete", value: 25 }),
      );
      expect(slider).toMatch(/<output[^>]*>1\.50<\/output>/);
      expect(number).toContain('value="1.50"');
      expect(progress).toContain("25%");
      expect(progress).not.toContain("25 %");
    } finally {
      formatter.mockRestore();
    }
  });

  it("allows an explicit locale for every displayed value", () => {
    const slider = renderToStaticMarkup(
      createElement(Slider, {
        label: "Espacement",
        defaultValue: 1.5,
        locale: "fr-FR",
      }),
    );
    const number = renderToStaticMarkup(
      createElement(NumberField, {
        label: "Taux",
        defaultValue: 1.5,
        locale: "fr-FR",
      }),
    );
    const progress = renderToStaticMarkup(
      createElement(Progress, { label: "Terminé", value: 25, locale: "fr-FR" }),
    );
    expect(slider).toMatch(/<output[^>]*>1,5<\/output>/);
    expect(number).toContain('value="1,5"');
    expect(progress).toContain("25 %");
  });
});
