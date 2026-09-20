"use client";
import { Collapsible as Base } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";
export function Collapsible({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  disabled = false,
  keepMounted = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  keepMounted?: boolean;
}) {
  return (
    <Base.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className="cr-collapsible"
    >
      <Base.Trigger
        className="cr-button cr-collapsible-trigger"
        data-variant="ghost"
      >
        {title}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Base.Trigger>
      <Base.Panel keepMounted={keepMounted} className="cr-collapsible-panel">
        {children}
      </Base.Panel>
    </Base.Root>
  );
}
