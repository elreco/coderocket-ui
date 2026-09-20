"use client";
import { Menu as Base } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";
import { usePortalContainer } from "./utils";
export interface MenuAction {
  id?: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
}
export function Dropdown({
  trigger,
  triggerRender,
  items,
  disabled = false,
  side = "bottom",
  align = "start",
  emptyMessage = "No actions available.",
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  trigger?: ReactNode;
  triggerRender?: ComponentProps<typeof Base.Trigger>["render"];
  items: MenuAction[];
  disabled?: boolean;
  side?: ComponentProps<typeof Base.Positioner>["side"];
  align?: ComponentProps<typeof Base.Positioner>["align"];
  emptyMessage?: ReactNode;
}) {
  const container = usePortalContainer();
  return (
    <Base.Root {...rootProps}>
      <Base.Trigger
        render={triggerRender}
        disabled={disabled}
        className="cr-button"
        data-variant="outline"
      >
        {trigger}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Base.Trigger>
      <Base.Portal container={container}>
        <Base.Positioner
          side={side}
          align={align}
          sideOffset={6}
          className="cr-positioner"
        >
          <Base.Popup className="cr-popup">
            {!items.length && <p className="cr-description">{emptyMessage}</p>}
            {items.map((item, index) => (
              <Base.Item
                key={item.id ?? index}
                render={
                  item.href && !item.disabled ? (
                    <a href={item.href}>{item.label}</a>
                  ) : undefined
                }
                className="cr-menu-item"
                data-destructive={item.destructive || undefined}
                disabled={item.disabled}
                onClick={item.onSelect}
              >
                {item.label}
              </Base.Item>
            ))}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
