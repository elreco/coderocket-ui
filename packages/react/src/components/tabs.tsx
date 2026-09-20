"use client";
import { Tabs as Base } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  keepMounted = false,
  activateOnFocus = false,
}: {
  label: string;
  items: Array<{
    value: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
  }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  keepMounted?: boolean;
  activateOnFocus?: boolean;
}) {
  return (
    <Base.Root
      value={value}
      defaultValue={defaultValue ?? items.find((item) => !item.disabled)?.value}
      onValueChange={(v) => {
        if (typeof v === "string") onValueChange?.(v);
      }}
      className="cr-tabs"
    >
      <Base.List
        activateOnFocus={activateOnFocus}
        aria-label={label}
        className="cr-tabs-list"
      >
        {items.map((item) => (
          <Base.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="cr-tab"
          >
            {item.label}
          </Base.Tab>
        ))}
      </Base.List>
      {items.map((item) => (
        <Base.Panel
          key={item.value}
          value={item.value}
          className="cr-tab-panel"
          keepMounted={keepMounted}
        >
          {item.content}
        </Base.Panel>
      ))}
    </Base.Root>
  );
}
