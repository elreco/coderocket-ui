"use client";
import type { ReactNode } from "react";
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="cr-empty-state">
      {icon && (
        <div aria-hidden="true" className="cr-empty-icon">
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {description && <p className="cr-description">{description}</p>}
      {action}
    </section>
  );
}
