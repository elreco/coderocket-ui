"use client";
import type { ComponentProps } from "react";
import { RadioGroup as Group } from "@base-ui/react/radio-group";
import { Radio as Base } from "@base-ui/react/radio";
import { cx } from "./utils";
export function RadioGroup({
  label,
  options,
  className,
  ...props
}: Omit<ComponentProps<typeof Group>, "className" | "children"> & {
  label: string;
  className?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
  return (
    <Group
      {...props}
      aria-label={label}
      className={cx("cr-radio-group", className)}
    >
      {options.map((option) => (
        <label
          className="cr-check-label"
          key={option.value}
          data-disabled={props.disabled || option.disabled || undefined}
        >
          <Base.Root
            value={option.value}
            disabled={option.disabled}
            className="cr-radio"
          >
            <Base.Indicator className="cr-radio-indicator" />
          </Base.Root>
          {option.label}
        </label>
      ))}
    </Group>
  );
}
