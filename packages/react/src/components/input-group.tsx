"use client";
import type { ReactNode } from "react";
import { Input, type InputProps } from "./input";
export function InputGroup({
  leading,
  trailing,
  ...props
}: InputProps & { leading?: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="cr-input-group">
      {leading && <span className="cr-input-addon">{leading}</span>}
      <Input {...props} />
      {trailing && <span className="cr-input-addon">{trailing}</span>}
    </div>
  );
}
