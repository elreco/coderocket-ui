"use client";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";
export function Alert({
  title,
  variant = "info",
  announce = false,
  role,
  children,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  variant?: "info" | "success" | "warning" | "destructive";
  announce?: boolean;
}) {
  return (
    <div
      {...props}
      role={role ?? (announce ? "alert" : undefined)}
      className={cx("cr-alert", className)}
      data-variant={variant}
    >
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  );
}
