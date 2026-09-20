"use client";
import { useEffect, useId, useRef, useState } from "react";
import { cx } from "./utils";
import { Button } from "./button";
import { Progress } from "./progress";
export interface UploadContext {
  signal: AbortSignal;
  onProgress: (percent: number) => void;
}
export interface FileUploadProps {
  id?: string;
  name?: string;
  form?: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxBytes?: number;
  onUpload?: (file: File, context: UploadContext) => Promise<void>;
  /** Called when a valid file is selected. */
  onFileSelect?: (file: File) => void;
  /** Also reports removal, rejection and native form resets with null. */
  onFileChange?: (file: File | null) => void;
}
function formatUploadSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Number((bytes / 1024 / 1024).toFixed(1))} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
export function validateUploadFile(
  file: Pick<File, "name" | "size" | "type">,
  accept: string | undefined,
  maxBytes: number,
): string | null {
  if (file.size > maxBytes) {
    const limit = formatUploadSize(maxBytes);
    return `Choose a file no larger than ${limit}.`;
  }
  const rules =
    accept
      ?.split(",")
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (
    rules.length > 0 &&
    !rules.some((rule) => {
      const mimeType = file.type.toLowerCase();
      return rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith("/*")
          ? mimeType.startsWith(rule.slice(0, -1))
          : mimeType === rule;
    })
  )
    return "This file type is not supported.";
  return null;
}
export function FileUpload({
  id,
  name,
  form,
  required = false,
  label = "Upload a file",
  accept,
  maxBytes = 10 * 1024 * 1024,
  onUpload,
  onFileSelect,
  onFileChange,
  disabled = false,
  className,
}: FileUploadProps) {
  const generatedId = useId(),
    hintId = useId(),
    errorId = useId(),
    controller = useRef<AbortController | null>(null),
    input = useRef<HTMLInputElement>(null);
  const inputId = id ?? generatedId;
  const [file, setFile] = useState<File | null>(null),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState<"idle" | "uploading" | "done">("idle"),
    [progress, setProgress] = useState<number | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner) return;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        controller.current?.abort();
        setFile(null);
        setStatus("idle");
        setProgress(null);
        setError("");
        setDragging(false);
        onFileChange?.(null);
      });
    }
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [form, onFileChange]);
  function choose(next: File | undefined, fromDrop = false) {
    if (!next || disabled || status === "uploading") return;
    const validationError = validateUploadFile(next, accept, maxBytes);
    setError(validationError ?? "");
    if (validationError) {
      setFile(null);
      setStatus("idle");
      setProgress(null);
      if (input.current) input.current.value = "";
      onFileChange?.(null);
      return;
    }
    if (fromDrop && input.current) {
      const transfer = new DataTransfer();
      transfer.items.add(next);
      input.current.files = transfer.files;
    }
    controller.current?.abort();
    setFile(next);
    setStatus("idle");
    setProgress(null);
    onFileSelect?.(next);
    onFileChange?.(next);
  }
  async function upload() {
    if (!file || !onUpload || disabled || status === "uploading") return;
    const active = new AbortController();
    controller.current = active;
    setStatus("uploading");
    setError("");
    setProgress(null);
    try {
      await onUpload(file, {
        signal: active.signal,
        onProgress: (value) => {
          if (!active.signal.aborted)
            setProgress(
              Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null,
            );
        },
      });
      if (!active.signal.aborted) {
        setProgress(100);
        setStatus("done");
      }
    } catch {
      if (!active.signal.aborted) {
        setError("Upload failed. Please try again.");
        setStatus("idle");
      }
    }
  }
  return (
    <div
      className={cx("cr-file-upload", className)}
      aria-busy={status === "uploading" || undefined}
    >
      <div
        className="cr-dropzone"
        data-dragging={dragging || undefined}
        data-disabled={disabled || status === "uploading" || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && status !== "uploading") setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (status !== "uploading") choose(event.dataTransfer.files[0], true);
        }}
      >
        <svg
          width="24"
          height="24"
          className="cr-upload-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
        <label htmlFor={inputId} className="cr-label">
          {label}
        </label>
        <input
          ref={input}
          id={inputId}
          type="file"
          name={name}
          form={form}
          required={required}
          accept={accept}
          disabled={disabled || status === "uploading"}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <p id={hintId} className="cr-description">
          Choose or drop one file. Up to {formatUploadSize(maxBytes)}.
        </p>
      </div>
      {file && (
        <div
          className="cr-stack"
          style={{ marginTop: "calc(var(--cr-space)*4)" }}
        >
          <p className="cr-description">
            {file.name} · {Math.ceil(file.size / 1024)} KB
          </p>
          {status === "uploading" && (
            <Progress label="Upload progress" value={progress} />
          )}
          <div className="cr-row">
            {onUpload && status !== "done" && (
              <Button
                disabled={disabled}
                loading={status === "uploading"}
                onClick={upload}
              >
                Upload
              </Button>
            )}
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => {
                controller.current?.abort();
                setStatus("idle");
                setFile(null);
                setProgress(null);
                setError("");
                onFileChange?.(null);
                if (input.current) {
                  input.current.value = "";
                  input.current.focus();
                }
              }}
            >
              {status === "uploading" ? "Cancel upload" : "Remove file"}
            </Button>
          </div>
          {status === "done" && (
            <p role="status" className="cr-description">
              Upload complete.
            </p>
          )}
          {!onUpload && (
            <p className="cr-description">
              File selected locally. Connect onUpload to send it to your storage
              service.
            </p>
          )}
        </div>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="cr-description"
          style={{ color: "var(--cr-destructive)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
