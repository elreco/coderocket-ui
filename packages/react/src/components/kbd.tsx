"use client";
import type { HTMLAttributes } from "react";
import { cx } from "./utils";
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <kbd {...props} className={cx("cr-kbd", className)} />;
}
