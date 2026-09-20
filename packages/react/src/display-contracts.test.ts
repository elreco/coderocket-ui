import {
  createElement,
  type ComponentType,
  type ReactNode,
  type ReactElement,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Dialog } from "./components/dialog";
import { AlertDialog } from "./components/alert-dialog";
import { Drawer } from "./components/drawer";
import { Sheet } from "./components/sheet";
import { Popover } from "./components/popover";
import { Tooltip } from "./components/tooltip";
import { Dropdown } from "./components/dropdown";
import { DataTable } from "./components/data-table";
import { Table } from "./components/table";
import { Sidebar } from "./components/sidebar";
import { Tabs } from "./components/tabs";

const html = (element: ReactElement) => renderToStaticMarkup(element);
const modalComponents: Array<
  ComponentType<{
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    triggerRender?: ReactElement;
  }>
> = [Dialog, AlertDialog, Drawer, Sheet];

describe("overlay integration contracts", () => {
  it.each(
    modalComponents.map((Component) => [Component.name, Component] as const),
  )(
    "%s supports custom trigger composition without nested buttons",
    (_name, Component) => {
      const result = html(
        createElement(Component, {
          title: "Details",
          children: "Details content",
          triggerRender: createElement(
            "button",
            { "data-custom": "true" },
            "Open details",
          ),
          defaultOpen: true,
        }),
      );
      expect(result.match(/<button\b/g)).toHaveLength(1);
      expect(result).toContain('data-custom="true"');
      expect(result).toContain("Open details");
    },
  );

  it.each(
    modalComponents.map((Component) => [Component.name, Component] as const),
  )(
    "%s does not leave an empty trigger for programmatically controlled dialogs",
    (_name, Component) => {
      const result = html(
        createElement(Component, {
          title: "Details",
          children: "Content",
          open: false,
        }),
      );
      expect(result).not.toContain("<button");
    },
  );

  it("preserves custom trigger content for anchored overlays", () => {
    const triggerRender = createElement(
      "button",
      { "aria-label": "More information" },
      "Info",
    );
    const overlays = [
      createElement(Popover, {
        triggerRender,
        title: "Info",
        children: "Details",
      }),
      createElement(Tooltip, { triggerRender, content: "Details" }),
      createElement(Dropdown, { triggerRender, items: [] }),
    ];
    for (const element of overlays) {
      const result = html(element);
      expect(result.match(/<button\b/g)).toHaveLength(1);
      expect(result).toContain('aria-label="More information"');
      expect(result).toContain("Info");
    }
  });
});

describe("data presentation states", () => {
  const columns = [
    { key: "name", label: "Name" },
    { key: "score", label: "Score" },
  ];
  const rows = [
    { id: 1, name: "Alma", score: 10 },
    { id: 2, name: "Boris", score: 2 },
    { id: 3, name: "Chloe", score: 5 },
  ];

  it("supports server-selected query, sorting and page on the initial render", () => {
    const result = html(
      createElement(DataTable, {
        caption: "People",
        columns,
        rows,
        query: "",
        page: 2,
        pageSize: 1,
        sort: { key: "score", direction: 1 },
      }),
    );
    const body = result.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
    expect(body).toContain("Chloe");
    expect(body).not.toContain("Alma");
    expect(result).toContain('aria-sort="ascending"');
    expect(result).toContain("2–2 of 3 records");
  });

  it("uses controlled null sort and empty search instead of stale defaults", () => {
    const result = html(
      createElement(DataTable, {
        caption: "People",
        columns,
        rows,
        query: "",
        defaultQuery: "missing",
        sort: null,
        defaultSort: { key: "score", direction: 1 },
      }),
    );
    expect(result).toContain("1–3 of 3 records");
    expect(result).not.toContain("aria-sort=");
    expect(result.indexOf("Alma")).toBeLessThan(result.indexOf("Boris"));
  });

  it("renders semantic custom cells without serializing them as strings", () => {
    const result = html(
      createElement(DataTable, {
        caption: "People",
        rows,
        columns: [
          {
            key: "name",
            label: "Name",
            render: (value) =>
              createElement("a", { href: `/people/${value}` }, value),
          },
        ],
      }),
    );
    expect(result).toContain('<a href="/people/Alma">Alma</a>');
  });

  it("marks pending tables busy and disables paging without showing misleading empty results", () => {
    const result = html(
      createElement(DataTable, {
        caption: "People",
        columns,
        rows: [],
        loading: true,
      }),
    );
    expect(result).toContain('aria-busy="true"');
    expect(result).toContain('role="status">Loading records…');
    expect(result).not.toContain("No matching records.");
    expect(result).toMatch(
      /<button(?=[^>]*aria-label="Page 1")(?=[^>]*disabled="")/,
    );
  });

  it("shows customizable empty and loading states in the simple table", () => {
    expect(
      html(
        createElement(Table, {
          caption: "People",
          columns: ["Name"],
          rows: [],
          emptyMessage: "Invite someone",
        }),
      ),
    ).toContain('<td colSpan="1">Invite someone</td>');
    const result = html(
      createElement(Table, {
        caption: "People",
        columns: ["Name"],
        rows: [["Alma"]],
        loading: true,
        loadingMessage: "Loading people",
      }),
    );
    expect(result).toContain('aria-busy="true"');
    expect(result).toContain("Loading people");
    expect(result).not.toContain("Alma");
  });

  it("keeps sidebar state controllable and collapsed links named", () => {
    const result = html(
      createElement(Sidebar, {
        brand: "Brand",
        collapsed: true,
        defaultCollapsed: false,
        items: [{ label: "Dashboard", href: "/dashboard", active: true }],
      }),
    );
    expect(result).toContain('data-collapsed="true"');
    expect(result).toContain('aria-label="Dashboard" aria-current="page"');
    expect(result).not.toContain("Brand");
  });

  it("allows hidden tab forms to stay mounted when preservation is requested", () => {
    const result = html(
      createElement(Tabs, {
        label: "Settings",
        keepMounted: true,
        items: [
          { value: "a", label: "First", content: "First content" },
          { value: "b", label: "Second", content: "Second content" },
        ],
      }),
    );
    expect(result).toContain("First content");
    expect(result).toContain("Second content");
    expect(result).toMatch(/hidden=""[^>]*>Second content/);
  });
});
