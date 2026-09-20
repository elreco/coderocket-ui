"use client";
import { ContextMenu as Base } from "@base-ui/react/context-menu";
import { Menu } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";
import type { MenuAction } from "./dropdown";
import { usePortalContainer } from "./utils";
export function ContextMenu({
  children,
  items,
  emptyMessage = "No actions available.",
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  children: ReactNode;
  items: MenuAction[];
  emptyMessage?: ReactNode;
}) {
  const container = usePortalContainer();
  return (
    <Base.Root {...rootProps}>
      <Base.Trigger className="cr-context-trigger" tabIndex={0}>
        {children}
      </Base.Trigger>
      <Menu.Portal container={container}>
        <Menu.Positioner className="cr-positioner">
          <Menu.Popup className="cr-popup">
            {!items.length && <p className="cr-description">{emptyMessage}</p>}
            {items.map((item, index) => (
              <Menu.Item
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
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Base.Root>
  );
}
