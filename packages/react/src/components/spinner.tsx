"use client";
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="cr-spinner-container" role="status">
      <span className="cr-spinner" aria-hidden="true" />
      <span className="cr-sr-only">{label}</span>
    </span>
  );
}
