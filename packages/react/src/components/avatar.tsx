"use client";
import type { ComponentProps, CSSProperties } from "react";
import { Avatar as Base } from "@base-ui/react/avatar";
import { cx } from "./utils";
export function Avatar({
  src,
  name,
  size = 36,
  className,
  style,
  ...props
}: Omit<
  ComponentProps<typeof Base.Root>,
  "className" | "children" | "style"
> & {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => Array.from(word)[0] ?? "")
      .join("")
      .toLocaleUpperCase() || "?";
  return (
    <Base.Root
      {...props}
      className={cx("cr-avatar", className)}
      style={{ width: size, height: size, ...style }}
    >
      <Base.Image src={src} alt={name} className="cr-avatar-image" />
      <Base.Fallback role="img" aria-label={name || "Avatar"}>
        {initials}
      </Base.Fallback>
    </Base.Root>
  );
}
