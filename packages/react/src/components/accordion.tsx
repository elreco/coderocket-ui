"use client";
import { Accordion as Base } from "@base-ui/react/accordion";
import type { ReactNode } from "react";
export function Accordion({
  items,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  keepMounted = false,
}: {
  items: Array<{
    value: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  keepMounted?: boolean;
}) {
  return (
    <Base.Root
      multiple={multiple}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className="cr-accordion"
    >
      {items.map((item) => (
        <Base.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="cr-accordion-item"
        >
          <Base.Header>
            <Base.Trigger className="cr-accordion-trigger">
              {item.title}
              <span aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </Base.Trigger>
          </Base.Header>
          <Base.Panel keepMounted={keepMounted} className="cr-accordion-panel">
            {item.content}
          </Base.Panel>
        </Base.Item>
      ))}
    </Base.Root>
  );
}
