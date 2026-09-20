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
}
export function formatUploadSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Number((bytes / 1024 / 1024).toFixed(1))} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
export function validateUploadFile(
  file: Pick<File, "name" | "size" | "type">,
  accept: string | undefined,
  maxBytes: number,
): string | null {
  if (file.size > maxBytes)
    return `Choose a file no larger than ${formatUploadSize(maxBytes)}.`;
  const rules =
    accept
      ?.split(",")
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (
    rules.length &&
    !rules.some((rule) =>
      rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith("/*")
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule,
    )
  )
    return "This file type is not supported.";
  return null;
}
