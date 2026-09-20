"use client";
import type { ComponentProps } from "react";
import { Separator as Base } from "@base-ui/react/separator";
import { cx } from "./utils";
export function Separator({
  className,
  ...props
}: Omit<ComponentProps<typeof Base>, "className"> & { className?: string }) {
  return <Base {...props} className={cx("cr-separator", className)} />;
}
