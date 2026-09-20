"use client";
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The named overflow region needs a tab stop for keyboard scrolling. */
import type { ReactNode } from "react";
export function Table({
  caption,
  columns,
  rows,
  loading = false,
  loadingMessage = "Loading records…",
  emptyMessage = "No records yet.",
  getRowKey,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  loading?: boolean;
  loadingMessage?: ReactNode;
  emptyMessage?: ReactNode;
  getRowKey?: (row: ReactNode[], index: number) => string | number;
}) {
  return (
    <div
      className="cr-table-scroll"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="cr-table" aria-busy={loading || undefined}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading &&
            rows.map((row, index) => (
              <tr key={getRowKey?.(row, index) ?? index}>
                {row.map((value, column) => (
                  <td key={column}>{value}</td>
                ))}
              </tr>
            ))}
          {(loading || !rows.length) && (
            <tr>
              <td colSpan={Math.max(1, columns.length)}>
                {loading ? loadingMessage : emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
