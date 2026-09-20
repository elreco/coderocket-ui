import { z } from "zod";
export const emailSchema = z.string().trim().email().max(254);
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128);
export const libraryNameSchema = z.string().trim().min(1).max(80);
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/studio",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    // URL parsing strips control characters, which can disguise a //host redirect.
    // eslint-disable-next-line no-control-regex
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return fallback;
  return value;
}
