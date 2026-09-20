"use client";
import { useState, useRef, type ReactNode } from "react";
import type {
  Composition,
  CompositionNode,
} from "@coderocket/specs/composition";
import {
  Button,
  Card,
  Input,
  Textarea,
  Field,
  Checkbox,
  Switch,
  Select,
  Badge,
  Progress,
  Avatar,
  Separator,
} from "./index";
export type CompositionAction = (
  action: string,
  values?: Record<string, FormDataEntryValue>,
) => void | Promise<void>;
export function CompositionPreview({
  composition,
  onAction,
}: {
  composition: Composition;
  onAction?: CompositionAction;
}) {
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function act(
    action: string,
    values?: Record<string, FormDataEntryValue>,
  ) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (onAction) await onAction(action, values);
      else
        setNotice(
          `Preview action: ${action}. Connect your application's handler after export.`,
        );
    } catch {
      setNotice("The action could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function render(node: CompositionNode): ReactNode {
    const children = composition.nodes
      .filter((item) => item.parent === node.id)
      .map((child) => <div key={child.id}>{render(child)}</div>);
    const field = { name: node.name, required: node.required };
    switch (node.kind) {
      case "stack":
        return <div className="cr-stack">{children}</div>;
      case "row":
        return <div className="cr-row">{children}</div>;
      case "grid":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,220px),1fr))`,
              gap: "calc(var(--cr-space) * 4)",
            }}
          >
            {children}
          </div>
        );
      case "card":
        return (
          <Card
            title={node.text || undefined}
            description={node.description || undefined}
          >
            {children}
          </Card>
        );
      case "form":
        return (
          <form
            aria-label={node.text || composition.name}
            className="cr-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void act(
                node.action!,
                Object.fromEntries(new FormData(event.currentTarget)),
              );
            }}
          >
            {children}
          </form>
        );
      case "heading":
        return <h2>{node.text}</h2>;
      case "text":
        return <p className="cr-description">{node.text}</p>;
      case "button":
        return (
          <Button
            disabled={busy}
            variant={
              [
                "primary",
                "secondary",
                "outline",
                "ghost",
                "destructive",
              ].includes(node.variant || "")
                ? (node.variant as "primary")
                : "primary"
            }
            type={node.action === "submit" ? "submit" : "button"}
            onClick={
              node.action === "submit"
                ? undefined
                : () => void act(node.action!)
            }
          >
            {node.text}
          </Button>
        );
      case "badge":
        return (
          <Badge
            variant={
              [
                "secondary",
                "outline",
                "destructive",
                "success",
                "warning",
              ].includes(node.variant || "")
                ? (node.variant as "success")
                : "secondary"
            }
          >
            {node.text}
          </Badge>
        );
      case "separator":
        return <Separator />;
      case "input":
        return (
          <Field label={node.text} description={node.description}>
            <Input {...field} type={node.inputType || "text"} />
          </Field>
        );
      case "textarea":
        return (
          <Field label={node.text} description={node.description}>
            <Textarea {...field} />
          </Field>
        );
      case "checkbox":
        return <Checkbox {...field} label={node.text} />;
      case "switch":
        return <Switch {...field} label={node.text} />;
      case "select":
        return (
          <Field label={node.text} description={node.description}>
            <Select {...field} label={node.text} options={node.options!} />
          </Field>
        );
      case "progress":
        return <Progress label={node.text} value={node.value ?? 0} />;
      case "avatar":
        return <Avatar name={node.text} />;
      case "file-upload":
        return (
          <FileSelection
            label={node.text}
            name={node.name!}
            required={node.required}
            onFiles={(files) =>
              void act(
                node.action || node.name!,
                Object.fromEntries(files.map((file, i) => [String(i), file])),
              )
            }
          />
        );
    }
  }
  return (
    <div className="cr-stack">
      {render(composition.nodes.find((node) => node.parent === null)!)}
      <p role="status" className="cr-description">
        {busy ? "Working…" : notice}
      </p>
    </div>
  );
}
/** Selection and drop are local; uploading is an explicit integrating-application callback. */
export function FileSelection({
  label,
  name,
  required,
  onFiles,
}: {
  label: string;
  name: string;
  required?: boolean;
  onFiles?: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]),
    input = useRef<HTMLInputElement>(null);
  const choose = (next: File[]) => {
    setFiles(next);
    onFiles?.(next);
  };
  return (
    <div
      className="cr-stack"
      style={{
        border: "var(--cr-border-width) dashed var(--cr-border)",
        borderRadius: "var(--cr-radius-md)",
        padding: "calc(var(--cr-space) * 4)",
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const dropped = Array.from(event.dataTransfer.files);
        if (input.current) {
          const transfer = new DataTransfer();
          dropped.forEach((file) => transfer.items.add(file));
          input.current.files = transfer.files;
        }
        choose(dropped);
      }}
    >
      <label className="cr-field">
        <span className="cr-label">{label}</span>
        <input
          ref={input}
          type="file"
          name={name}
          required={required}
          multiple
          onChange={(event) => choose(Array.from(event.target.files || []))}
        />
      </label>
      <p className="cr-description">Drop files here or use the file chooser.</p>
      <ul aria-live="polite">
        {files.map((file, index) => (
          <li key={index}>
            {file.name} · {Math.ceil(file.size / 1024)} KB
          </li>
        ))}
      </ul>
    </div>
  );
}
