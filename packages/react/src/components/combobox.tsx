"use client";
import type { ComponentProps } from "react";
import { Combobox as Base } from "@base-ui/react/combobox";
import { cx, usePortalContainer } from "./utils";
export type ComboboxProps = Omit<
  Base.Root.Props<string>,
  "children" | "items" | "filteredItems" | "multiple" | "virtualized" | "inline"
> & {
  label: string;
  items: readonly string[];
  filteredItems?: readonly string[];
  placeholder?: string;
  className?: string;
  inputProps?: Omit<
    ComponentProps<typeof Base.Input>,
    "className" | "render" | "value" | "defaultValue" | "disabled" | "required"
  >;
  isItemDisabled?: (item: string) => boolean;
  emptyLabel?: string;
  clearable?: boolean;
};
export function Combobox({
  label,
  items,
  placeholder = "Search…",
  className,
  inputProps,
  isItemDisabled,
  emptyLabel = "No results found.",
  clearable = false,
  ...props
}: ComboboxProps) {
  const container = usePortalContainer();
  return (
    <Base.Root {...props} items={items}>
      <Base.InputGroup className={cx("cr-input-group", className)}>
        <Base.Input
          aria-label={label}
          placeholder={placeholder}
          {...inputProps}
          className="cr-input"
        />
        {clearable && (
          <Base.Clear aria-label={"Clear " + label} className="cr-input-addon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </Base.Clear>
        )}
        <Base.Trigger aria-label={"Open " + label} className="cr-input-addon">
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
      </Base.InputGroup>
      <Base.Portal container={container}>
        <Base.Positioner sideOffset={6} className="cr-positioner">
          <Base.Popup className="cr-popup">
            <Base.Empty className="cr-menu-item">{emptyLabel}</Base.Empty>
            <Base.List>
              {(item: string) => (
                <Base.Item
                  key={item}
                  value={item}
                  disabled={isItemDisabled?.(item)}
                  className="cr-menu-item"
                >
                  {item}
                  <Base.ItemIndicator>
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
                      <path d="m20 6-11 11-5-5" />
                    </svg>
                  </Base.ItemIndicator>
                </Base.Item>
              )}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
