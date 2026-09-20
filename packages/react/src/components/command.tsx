"use client";
import { Combobox as Base } from "@base-ui/react/combobox";
import { Dialog } from "./dialog";
import { useRef, useState, type ReactNode } from "react";
export interface CommandItem {
  value: string;
  label: string;
  description?: string;
  onSelect: () => void;
  disabled?: boolean;
}
export function Command({
  trigger = "Open commands",
  title = "Command menu",
  items,
  open,
  onOpenChange,
  defaultOpen = false,
  searchLabel = "Search commands",
  searchPlaceholder = "Search commands…",
  emptyMessage = "No matching commands.",
}: {
  trigger?: ReactNode;
  title?: string;
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultOpen);
  const input = useRef<HTMLInputElement>(null);
  const setOpen = (value: boolean) => {
    if (open === undefined) setInternal(value);
    onOpenChange?.(value);
  };
  return (
    <Dialog
      trigger={trigger}
      title={title}
      open={open ?? internal}
      onOpenChange={setOpen}
      initialFocus={input}
    >
      <Base.Root
        items={items}
        inline
        open={open ?? internal}
        autoHighlight
        value={null}
        itemToStringLabel={(item: CommandItem) => item.label}
        onValueChange={(item: CommandItem | null) => {
          if (item && !item.disabled) {
            item.onSelect();
            setOpen(false);
          }
        }}
      >
        <Base.Input
          ref={input}
          className="cr-input"
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
        />
        <Base.Empty className="cr-description">{emptyMessage}</Base.Empty>
        <Base.List className="cr-command-list">
          {(item: CommandItem) => (
            <Base.Item
              className="cr-menu-item"
              key={item.value}
              value={item}
              disabled={item.disabled}
            >
              <span className="cr-command-item-text">
                <span>{item.label}</span>
                {item.description && (
                  <small className="cr-description">{item.description}</small>
                )}
              </span>
            </Base.Item>
          )}
        </Base.List>
      </Base.Root>
    </Dialog>
  );
}
