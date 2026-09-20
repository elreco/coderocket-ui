"use client";
import { Popover as Base } from "@base-ui/react/popover";
import type { ComponentProps, ReactNode } from "react";
import { usePortalContainer } from "./utils";
export function Popover({
  trigger,
  triggerRender,
  title,
  children,
  open,
  onOpenChange,
  disabled,
  triggerLabel,
  initialFocus,
  finalFocus,
  side = "bottom",
  align = "center",
  closeLabel = "Close popover",
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  trigger?: ReactNode;
  triggerRender?: ComponentProps<typeof Base.Trigger>["render"];
  title: string;
  children: ReactNode;
  disabled?: boolean;
  triggerLabel?: string;
  initialFocus?: ComponentProps<typeof Base.Popup>["initialFocus"];
  finalFocus?: ComponentProps<typeof Base.Popup>["finalFocus"];
  side?: ComponentProps<typeof Base.Positioner>["side"];
  align?: ComponentProps<typeof Base.Positioner>["align"];
  closeLabel?: string;
}) {
  const container = usePortalContainer();
  return (
    <Base.Root {...rootProps} open={open} onOpenChange={onOpenChange}>
      {(trigger != null || triggerRender != null) && (
        <Base.Trigger
          render={triggerRender}
          className="cr-button"
          data-variant="outline"
          disabled={disabled}
          aria-label={triggerLabel}
        >
          {trigger}
        </Base.Trigger>
      )}
      <Base.Portal container={container}>
        <Base.Positioner
          side={side}
          align={align}
          sideOffset={8}
          className="cr-positioner"
        >
          <Base.Popup
            className="cr-popup cr-popover"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <Base.Title className="cr-popover-title">{title}</Base.Title>
            {children}
            <Base.Close aria-label={closeLabel} className="cr-popover-close">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </Base.Close>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
