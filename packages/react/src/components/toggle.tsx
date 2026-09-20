"use client";
import { Toggle as Base } from "@base-ui/react/toggle";
import type { ComponentProps } from "react";
import { cx } from "./utils";
export function Toggle({
  className,
  ...props
}: Omit<ComponentProps<typeof Base>, "className"> & { className?: string }) {
  return <Base {...props} className={cx("cr-toggle", className)} />;
}
