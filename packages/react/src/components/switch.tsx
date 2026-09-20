"use client";
import type { ComponentProps, ReactNode } from "react";
import { Switch as Base } from "@base-ui/react/switch";
import { cx } from "./utils";
export function Switch({
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
      <Base.Root {...props} className={cx("cr-switch", className)}>
        <Base.Thumb className="cr-switch-thumb" />
      </Base.Root>
      <span>{label}</span>
    </label>
  );
}
