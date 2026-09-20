"use client";
import type { ComponentProps, ReactNode } from "react";
import { Checkbox as Base } from "@base-ui/react/checkbox";
import { cx } from "./utils";
export function Checkbox({
  label,
  className,
  ...props
}: Omit<ComponentProps<typeof Base.Root>, "className"> & {
  label: ReactNode;
  className?: string;
}) {
  return (
    <label
      className="cr-check-label"
      data-disabled={props.disabled || undefined}
    >
      <Base.Root {...props} className={cx("cr-checkbox", className)}>
        <Base.Indicator className="cr-check-indicator">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={props.indeterminate ? "M5 12h14" : "m5 12 4 4L19 6"} />
          </svg>
        </Base.Indicator>
      </Base.Root>
      <span>{label}</span>
    </label>
  );
}
