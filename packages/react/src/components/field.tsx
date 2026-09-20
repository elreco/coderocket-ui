"use client";
import type { ComponentProps, ReactNode } from "react";
import { Field as Base } from "@base-ui/react/field";
import { cx } from "./utils";
export function Field({
  label,
  description,
  error,
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof Base.Root>, "className"> & {
  label: ReactNode;
  className?: string;
  description?: ReactNode;
  error?: ReactNode;
}) {
  return (
    <Base.Root
      {...props}
      invalid={Boolean(error) || props.invalid}
      className={cx("cr-field", className)}
    >
      <Base.Label className="cr-label">{label}</Base.Label>
      {description && (
        <Base.Description className="cr-description">
          {description}
        </Base.Description>
      )}
      {children}
      {error ? (
        <Base.Error match className="cr-field-error">
          {error}
        </Base.Error>
      ) : (
        <Base.Error className="cr-field-error" />
      )}
    </Base.Root>
  );
}
