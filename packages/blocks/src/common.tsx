"use client";
import { useState, useRef, type ReactNode, type FormEvent } from "react";
import { Alert, Button, Card } from "@coderocket/react";
export type FormAction = (values: FormData) => void | Promise<void>;
export function ActionForm({
  onSubmit,
  children,
  submitLabel = "Save changes",
  successMessage = "Saved.",
  validate,
  submitIcon,
}: {
  onSubmit: FormAction;
  children: ReactNode;
  submitLabel?: string;
  successMessage?: string;
  validate?: (values: FormData) => string | undefined;
  submitIcon?: ReactNode;
}) {
  const [state, setState] = useState<"idle" | "busy" | "success" | "error">(
    "idle",
  );
  const pending = useRef(false);
  const [errorMessage, setErrorMessage] = useState("Please try again.");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    const data = new FormData(event.currentTarget);
    setState("busy");
    setErrorMessage("Please try again.");
    try {
      const validationError = validate?.(data);
      if (validationError) {
        setErrorMessage(validationError);
        setState("error");
        return;
      }
      await onSubmit(data);
      setState("success");
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }
  return (
    <form
      className="cr-stack cr-block-action-form"
      aria-busy={state === "busy" || undefined}
      onSubmit={submit}
      onChange={() => {
        if (!pending.current) setState("idle");
      }}
    >
      {children}
      <Button type="submit" loading={state === "busy"}>
        {submitLabel}
        {state !== "busy" && submitIcon}
      </Button>
      {state === "success" && (
        <p role="status" className="cr-description">
          {successMessage}
        </p>
      )}
      {state === "error" && (
        <Alert
          title="Unable to complete this action"
          variant="destructive"
          announce
        >
          {errorMessage}
        </Alert>
      )}
    </form>
  );
}
export function BlockCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="cr-block-form">
      <Card title={title} description={description}>
        {children}
      </Card>
    </div>
  );
}
