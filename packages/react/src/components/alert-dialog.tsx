"use client";
import { AlertDialog as Base } from "@base-ui/react/alert-dialog";
import type { ComponentProps, ReactNode } from "react";
import { cx, usePortalContainer } from "./utils";
export function AlertDialog({
  trigger,
  triggerRender,
  title,
  description,
  children,
  open,
  onOpenChange,
  initialFocus,
  finalFocus,
  className,
  footer,
  closeLabel = "Close",
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  trigger?: ReactNode;
  /** Replace the trigger element without nesting interactive controls. */
  triggerRender?: ComponentProps<typeof Base.Trigger>["render"];
  className?: string;
  title: string;
  description?: string;
  children: ReactNode;
  initialFocus?: ComponentProps<typeof Base.Popup>["initialFocus"];
  finalFocus?: ComponentProps<typeof Base.Popup>["finalFocus"];
  footer?: ReactNode;
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
        >
          {trigger}
        </Base.Trigger>
      )}
      <Base.Portal container={container}>
        <Base.Backdrop className="cr-backdrop" />
        <Base.Viewport className="cr-modal-viewport" data-kind="alert-dialog">
          <Base.Popup
            className={cx("cr-modal cr-alert-dialog", className)}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <header className="cr-modal-header">
              <Base.Title className="cr-modal-title">{title}</Base.Title>
              {description && (
                <Base.Description className="cr-description">
                  {description}
                </Base.Description>
              )}
              <Base.Close
                className="cr-modal-close"
                aria-label={closeLabel === "Close" ? "Close alert" : closeLabel}
              >
                <svg
                  width="18"
                  height="18"
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
            </header>
            <div className="cr-modal-content">{children}</div>
            {footer !== null && (
              <footer className="cr-modal-footer">
                {footer ?? (
                  <Base.Close className="cr-button" data-variant="secondary">
                    {closeLabel}
                  </Base.Close>
                )}
              </footer>
            )}
          </Base.Popup>
        </Base.Viewport>
      </Base.Portal>
    </Base.Root>
  );
}
