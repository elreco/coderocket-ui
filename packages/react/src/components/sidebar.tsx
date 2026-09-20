"use client";
import { useId, useState, type ReactNode } from "react";
import { Button } from "./button";
export function Sidebar({
  brand,
  items,
  footer,
  label = "Workspace navigation",
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
}: {
  brand: ReactNode;
  items: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    active?: boolean;
  }>;
  footer?: ReactNode;
  label?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (value: boolean) => {
    if (controlledCollapsed === undefined) setInternalCollapsed(value);
    onCollapsedChange?.(value);
  };
  const navigationId = useId();
  return (
    <aside className="cr-sidebar" data-collapsed={collapsed}>
      <div className="cr-sidebar-header">
        {!collapsed && brand}
        <Button
          variant="ghost"
          size="sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls={navigationId}
          className="cr-sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18m4-12 3 3-3 3" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18m7-12-3 3 3 3" />
            </svg>
          )}
        </Button>
      </div>
      <nav id={navigationId} aria-label={label}>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-label={collapsed ? item.label : undefined}
            aria-current={item.active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
          >
            <span className="cr-sidebar-icon" aria-hidden="true">
              {item.icon || (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                </svg>
              )}
            </span>
            {!collapsed && item.label}
          </a>
        ))}
      </nav>
      {!collapsed && footer && <footer>{footer}</footer>}
    </aside>
  );
}
