// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Dropdown } from "./components/dropdown";

it("blocks actions when an open dropdown becomes disabled", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const action = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const props = {
    open: true,
    items: [{ label: "Orange", href: "#orange", onSelect: action }],
  };

  try {
    await act(async () => root.render(createElement(Dropdown, props)));
    await act(async () =>
      root.render(createElement(Dropdown, { ...props, disabled: true })),
    );
    const item = document.querySelector<HTMLElement>('[role="menuitem"]')!;
    await act(async () => item.click());

    expect(action).not.toHaveBeenCalled();
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.hasAttribute("href")).toBe(false);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
