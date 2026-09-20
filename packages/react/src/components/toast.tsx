"use client";
import { Toast as Base } from "@base-ui/react/toast";
import { usePortalContainer } from "./utils";
import { Button } from "./button";
import type { ComponentProps } from "react";
export const useToast = Base.useToastManager;
export const createToastManager = Base.createToastManager;
export function ToastProvider({
  children,
  limit = 3,
  timeout = 6000,
  dismissLabel = "Dismiss notification",
  ...props
}: ComponentProps<typeof Base.Provider> & { dismissLabel?: string }) {
  return (
    <Base.Provider {...props} limit={limit} timeout={timeout}>
      {children}
      <ToastViewport dismissLabel={dismissLabel} />
    </Base.Provider>
  );
}
function ToastViewport({ dismissLabel }: { dismissLabel: string }) {
  const { toasts } = Base.useToastManager();
  const container = usePortalContainer();
  return (
    <Base.Portal container={container}>
      <Base.Viewport className="cr-toast-viewport">
        {toasts.map((toast) => (
          <Base.Root key={toast.id} toast={toast} className="cr-toast">
            <Base.Content>
              <Base.Title className="cr-toast-title" />
              <Base.Description className="cr-description" />
              {toast.actionProps && (
                <Base.Action className="cr-button" data-variant="secondary" />
              )}
            </Base.Content>
            <Base.Close aria-label={dismissLabel} className="cr-toast-close">
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
          </Base.Root>
        ))}
      </Base.Viewport>
    </Base.Portal>
  );
}
/** A self-contained notification example. Applications should use ToastProvider + useToast. */
export function Toast({
  title = "Changes saved",
  description = "Your preferences are up to date.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <ToastProvider>
      <ToastTrigger title={title} description={description} />
    </ToastProvider>
  );
}
function ToastTrigger({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const manager = useToast();
  return (
    <Button onClick={() => manager.add({ title, description })}>
      Show notification
    </Button>
  );
}
