"use client";
import type { ComponentProps } from "react";
import { Field as Base } from "@base-ui/react/field";
import { cx } from "./utils";
export function Textarea({
  className,
  rows = 4,
  id,
  name,
  value,
  defaultValue,
  disabled,
  required,
  readOnly,
  autoFocus,
  form,
  ...props
}: ComponentProps<"textarea">) {
  const controlProps = {
    id,
    name,
    value,
    defaultValue,
    disabled,
    required,
    readOnly,
    autoFocus,
    form,
  };
  return (
    <Base.Control
      {...controlProps}
      render={<textarea {...props} rows={rows} />}
      className={cx("cr-textarea", className)}
    />
  );
}
