"use client";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";
export function Card({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section {...props} className={cx("cr-card", className)}>
      {(title || description) && (
        <header className="cr-card-header">
          {title && <h3 className="cr-card-title">{title}</h3>}
          {description && <p className="cr-description">{description}</p>}
        </header>
      )}
      <div className="cr-card-body">{children}</div>
      {footer && <footer className="cr-card-footer">{footer}</footer>}
    </section>
  );
}
