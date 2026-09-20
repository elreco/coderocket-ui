"use client";
import type { ComponentProps } from "react";
import { Input as Base } from "@base-ui/react/input";
import { cx } from "./utils";
export type InputProps = Omit<ComponentProps<typeof Base>, "className"> & {
  className?: string;
};
export function Input({ className, ...props }: InputProps) {
  return <Base {...props} className={cx("cr-input", className)} />;
}
