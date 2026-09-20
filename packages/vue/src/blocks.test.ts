// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import Login from "./blocks/login.vue";
import ResetPassword from "./blocks/reset-password.vue";
import Otp from "./blocks/otp.vue";
import Profile from "./blocks/profile.vue";
import Settings from "./blocks/settings.vue";
import Team from "./blocks/team.vue";
import ApiKeys from "./blocks/api-keys.vue";
import Filters from "./blocks/filters.vue";
import Search from "./blocks/search.vue";
import BlockShowcase from "../preview/block-showcase.vue";
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
});
describe("Vue blocks", () => {
  it("submits labelled login fields once while pending and shows success", async () => {
    let finish: () => void = () => {};
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const wrapper = render(Login, {
      props: { onSubmit: submit, signupHref: "#signup", forgotHref: "#forgot" },
    });
    for (const label of wrapper.findAll("label"))
      expect(document.getElementById(label.attributes("for")!)).not.toBeNull();
    await wrapper.get('[name="email"]').setValue("alex@example.com");
    await wrapper.get('[name="password"]').setValue("long-password");
    await wrapper.get('[aria-label="Show password"]').trigger("click");
    expect(wrapper.get('[name="password"]').attributes("type")).toBe("text");
    await wrapper.get("form").trigger("submit");
    await wrapper.get("form").trigger("submit");
    expect(submit).toHaveBeenCalledOnce();
    expect(
      (submit.mock.calls[0] as unknown as [FormData])[0].get("email"),
    ).toBe("alex@example.com");
    expect(wrapper.get("form").attributes("aria-busy")).toBe("true");
    finish();
    await flushPromises();
    expect(wrapper.get('[role="status"]').text()).toBe("Signed in.");
  });
  it("validates matching passwords and handles rejected submissions", async () => {
    const submit = vi.fn(async () => {
      throw new Error("Rejected");
    });
    const wrapper = render(ResetPassword, { props: { onSubmit: submit } });
    await wrapper.get('[name="password"]').setValue("long-password-one");
    await wrapper.get('[name="confirmation"]').setValue("long-password-two");
    await wrapper.get("form").trigger("submit");
    expect(submit).not.toHaveBeenCalled();
    expect(wrapper.get('[role="alert"]').text()).toContain(
      "Passwords do not match",
    );
    await wrapper.get('[name="confirmation"]').setValue("long-password-one");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(submit).toHaveBeenCalledOnce();
    expect(wrapper.get('[role="alert"]').text()).toContain("Please try again.");
  });
  it("bounds verification code length and supplies native numeric validation", () => {
    const wrapper = render(Otp, { props: { onSubmit: vi.fn(), length: 99 } });
    const input = wrapper.get("input");
    expect(input.attributes("maxlength")).toBe("10");
    expect(input.attributes("pattern")).toBe("[0-9]{10}");
    expect(input.attributes("autocomplete")).toBe("one-time-code");
  });
  it("preserves profile defaults and submits named fields", async () => {
    const save = vi.fn();
    const wrapper = render(Profile, {
      props: {
        name: "Alex",
        email: "alex@example.com",
        bio: "Designer",
        onSave: save,
      },
    });
    expect(
      (wrapper.get('[name="name"]').element as HTMLInputElement).value,
    ).toBe("Alex");
    await wrapper.get("form").trigger("submit");
    expect(save.mock.calls[0][0].get("bio")).toBe("Designer");
  });
  it("submits settings notification switches through the tab panel", async () => {
    const save = vi.fn();
    const wrapper = render(Settings, {
      props: {
        workspaceName: "Acme",
        onSave: vi.fn(),
        onNotificationSave: save,
      },
    });
    await wrapper
      .findAll('[role="tab"]')[1]
      .trigger("keydown", { key: "Enter" });
    await flushPromises();
    await wrapper.get("form").trigger("submit");
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0][0].get("digest")).toBe("on");
    expect(save.mock.calls[0][0].get("mentions")).toBe("on");
  });
  it("surfaces failed member removal and key revocation without losing supplied rows", async () => {
    const team = render(Team, {
      props: {
        members: [
          {
            id: "alex",
            name: "Alex",
            email: "alex@example.com",
            role: "Owner",
          },
        ],
        onInvite: vi.fn(),
        onRemove: vi.fn(async () => {
          throw new Error("Denied");
        }),
      },
    });
    await team.get('[aria-label="Remove Alex"]').trigger("click");
    await flushPromises();
    expect(team.get('[role="alert"]').text()).toBe(
      "Unable to remove this member.",
    );
    expect(team.get("li").text()).toContain("Alex");
    const keys = render(ApiKeys, {
      props: {
        keys: [
          { id: "key", name: "Development", prefix: "demo_", created: "Today" },
        ],
        onCreate: vi.fn(),
        onRevoke: vi.fn(async () => {
          throw new Error("Denied");
        }),
      },
    });
    await keys.get('[aria-label="Revoke Development"]').trigger("click");
    await flushPromises();
    expect(keys.get('[role="alert"]').text()).toBe(
      "Unable to revoke this key.",
    );
  });
  it("emits updated filters and resets them, and selects filtered search results", async () => {
    const change = vi.fn();
    const filters = render(Filters, {
      props: {
        statuses: [{ value: "active", label: "Active" }],
        onChange: change,
      },
    });
    await filters.get('input[type="search"]').setValue("Portal");
    expect(change).toHaveBeenLastCalledWith({ query: "Portal", status: "all" });
    await filters
      .findAll("button")
      .find((button) => button.text().includes("Clear filters"))!
      .trigger("click");
    expect(change).toHaveBeenLastCalledWith({ query: "", status: "all" });
    const select = vi.fn();
    const search = render(Search, {
      props: {
        items: [
          { id: "1", title: "Portal", description: "Design review" },
          { id: "2", title: "Website", description: "Archived" },
        ],
        onSelect: select,
      },
    });
    await search.get("input").setValue("review");
    expect(search.findAll("li")).toHaveLength(1);
    await search.get("li button").trigger("click");
    expect(select).toHaveBeenCalledWith("1");
    await search.get("input").setValue("missing");
    expect(search.text()).toContain("No results found");
  });
  it("allows preview actions to change local state", async () => {
    const wrapper = render(BlockShowcase, { props: { slug: "team" } });
    expect(wrapper.findAll(".cr-workspace-member-list li")).toHaveLength(2);
    await wrapper.get('[aria-label="Remove Sam Taylor"]').trigger("click");
    await flushPromises();
    expect(wrapper.findAll(".cr-workspace-member-list li")).toHaveLength(1);
  });
  const slugs = [
    "login",
    "signup",
    "forgot-password",
    "reset-password",
    "otp",
    "app-sidebar",
    "app-header",
    "profile",
    "settings",
    "team",
    "billing",
    "api-keys",
    "notifications",
    "data-table",
    "filters",
    "search",
    "empty-state",
    "detail-view",
    "stats",
    "hero",
    "features",
    "pricing",
    "testimonials",
    "faq",
    "cta",
    "footer",
  ];
  it.each(slugs)(
    "mounts the complete %s preview without missing content or nested buttons",
    async (slug) => {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {}),
        warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const wrapper = render(BlockShowcase, { props: { slug } });
        await flushPromises();
        expect(wrapper.text()).not.toContain("Block unavailable");
        expect(wrapper.text().length).toBeGreaterThan(100);
        expect(wrapper.findAll("button button")).toHaveLength(0);
        expect(errors).not.toHaveBeenCalled();
        expect(warnings).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
        warnings.mockRestore();
      }
    },
  );
});
