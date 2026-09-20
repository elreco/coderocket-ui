"use client";
import { Button } from "./button";
export function Pagination({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
  disabled = false,
  previousLabel = "Previous",
  nextLabel = "Next",
  pageLabel = (value) => `Page ${value}`,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}) {
  const total = Number.isFinite(totalPages)
    ? Math.max(1, Math.floor(totalPages))
    : 1;
  const current = Number.isFinite(page)
    ? Math.max(1, Math.min(total, Math.floor(page)))
    : 1;
  const pages = Array.from(
    { length: Math.min(total, 5) },
    (_, i) => Math.max(1, Math.min(current - 2, total - 4)) + i,
  );
  return (
    <nav aria-label={label} className="cr-pagination">
      <Button
        variant="outline"
        size="sm"
        aria-label={previousLabel}
        disabled={disabled || current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === current ? "primary" : "ghost"}
          aria-current={p === current ? "page" : undefined}
          aria-label={pageLabel(p)}
          disabled={disabled}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        aria-label={nextLabel}
        disabled={disabled || current === total}
        onClick={() => onPageChange(current + 1)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </Button>
    </nav>
  );
}
