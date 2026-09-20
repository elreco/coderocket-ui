"use client";
import { useId, type ComponentProps } from "react";
import { NumberField as Base } from "@base-ui/react/number-field";
import { cx } from "./utils";
export type NumberFieldProps = Omit<
  ComponentProps<typeof Base.Root>,
  "className" | "children"
> & {
  label: string;
  className?: string;
};
export function NumberField({
  label,
  id,
  className,
  step = 1,
  defaultValue = 0,
  locale = "en-US",
  ...props
}: NumberFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Base.Root
      {...props}
      id={inputId}
      step={step}
      defaultValue={defaultValue}
      locale={locale}
      className={cx("cr-number-field", className)}
    >
      <Base.ScrubArea>
        <label htmlFor={inputId} className="cr-label">
          {label}
        </label>
        <Base.ScrubAreaCursor>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 8-4 4 4 4M1 12h22m-4-4 4 4-4 4" />
          </svg>
        </Base.ScrubAreaCursor>
      </Base.ScrubArea>
      <Base.Group className="cr-number-group">
        <Base.Decrement aria-label={"Decrease " + label}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
        </Base.Decrement>
        <Base.Input />
        <Base.Increment aria-label={"Increase " + label}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5v14" />
          </svg>
        </Base.Increment>
      </Base.Group>
    </Base.Root>
  );
}
