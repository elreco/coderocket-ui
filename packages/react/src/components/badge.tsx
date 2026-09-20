"use client";
import type { HTMLAttributes } from "react";
import { cx } from "./utils";
export function Badge({
  variant = "secondary",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?:
    "primary" | "secondary" | "success" | "warning" | "destructive" | "outline";
}) {
  return (
    <span
      {...props}
      data-variant={variant}
      className={cx("cr-badge", className)}
    />
  );
}
