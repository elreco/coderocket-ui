"use client";
import type { ComponentProps } from "react";
import { Select as Base } from "@base-ui/react/select";
import { cx, usePortalContainer } from "./utils";
export type SelectProps<Multiple extends boolean | undefined = false> = Omit<
  Base.Root.Props<string, Multiple>,
  "children" | "items"
> & {
  label: string;
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  className?: string;
  triggerProps?: Omit<
    ComponentProps<typeof Base.Trigger>,
    "children" | "className" | "render" | "disabled"
  >;
};
export function Select<Multiple extends boolean | undefined = false>({
  label,
  options,
  placeholder = "Select an option",
  className,
  triggerProps,
  ...props
}: SelectProps<Multiple>) {
  const container = usePortalContainer();
  return (
    <Base.Root {...props} items={options}>
      <Base.Trigger
        aria-label={label}
        {...triggerProps}
        className={cx("cr-select-trigger", className)}
      >
        <Base.Value placeholder={placeholder} className="cr-select-value" />
        <Base.Icon>
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
        </Base.Icon>
      </Base.Trigger>
      <Base.Portal container={container}>
        <Base.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="cr-positioner"
        >
          <Base.Popup className="cr-popup">
            <Base.List>
              {options.map((option) => (
                <Base.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="cr-menu-item"
                >
                  <Base.ItemText>{option.label}</Base.ItemText>
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
              ))}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
