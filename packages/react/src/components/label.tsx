"use client";
import type { LabelHTMLAttributes } from "react";
import { cx } from "./utils";
export function Label({
  className,
  htmlFor,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label {...props} htmlFor={htmlFor} className={cx("cr-label", className)}>
      {children}
    </label>
  );
}
