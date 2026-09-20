"use client";
import type { ComponentProps } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cx } from "./utils";
export type ButtonProps = Omit<
  ComponentProps<typeof BaseButton>,
  "className"
> & {
  className?: string;
  variant?:
    "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};
export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"] || undefined}
      className={cx("cr-button", className)}
      data-variant={variant}
      data-size={size}
    >
      {loading && <span className="cr-spinner" aria-hidden="true" />}
      {children}
    </BaseButton>
  );
}
