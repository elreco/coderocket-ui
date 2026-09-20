"use client";
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The named overflow region needs a tab stop for keyboard scrolling. */
import { useMemo, useState, type ReactNode } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Pagination } from "./pagination";
export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (
    value: string | number | undefined,
    row: Readonly<DataRow>,
  ) => ReactNode;
}
export type DataRow = Record<string, string | number>;
export interface DataSort {
  key: string;
  direction: 1 | -1;
}
export function DataTable({
  caption,
  columns,
  rows,
  pageSize = 5,
  query: controlledQuery,
  defaultQuery = "",
  onQueryChange,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  getRowKey,
  loading = false,
  loadingMessage = "Loading records…",
  emptyMessage = "No matching records.",
  searchPlaceholder = "Search records…",
  searchable = true,
}: {
  caption: string;
  columns: DataColumn[];
  rows: DataRow[];
  pageSize?: number;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  sort?: DataSort | null;
  defaultSort?: DataSort | null;
  onSortChange?: (sort: DataSort | null) => void;
  getRowKey?: (row: Readonly<DataRow>, index: number) => string | number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  emptyMessage?: ReactNode;
  searchPlaceholder?: string;
  searchable?: boolean;
}) {
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [internalSort, setInternalSort] = useState<DataSort | null>(
    defaultSort,
  );
  const [internalPage, setInternalPage] = useState(defaultPage);
  const query = controlledQuery ?? internalQuery;
  const sort = controlledSort !== undefined ? controlledSort : internalSort;
  const page = controlledPage ?? internalPage;
  const setPage = (value: number) => {
    if (controlledPage === undefined) setInternalPage(value);
    onPageChange?.(value);
  };
  const filtered = useMemo(() => {
    const list = rows.filter((row) =>
      columns.some((c) =>
        String(row[c.key] ?? "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    );
    if (sort)
      list.sort((a, b) => {
        const left = a[sort.key],
          right = b[sort.key];
        const comparison =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left ?? "").localeCompare(String(right ?? ""), undefined, {
                numeric: true,
              });
        return comparison * sort.direction;
      });
    return list;
  }, [rows, columns, query, sort]);
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 5;
  const total = Math.max(1, Math.ceil(filtered.length / size));
  const current = Number.isFinite(page)
    ? Math.max(1, Math.min(Math.floor(page), total))
    : 1;
  return (
    <div className="cr-data-table">
      {searchable && (
        <Input
          aria-label={"Search " + caption}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => {
            if (controlledQuery === undefined)
              setInternalQuery(event.target.value);
            onQueryChange?.(event.target.value);
            setPage(1);
          }}
        />
      )}
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
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort?.key === column.key
                      ? sort.direction === 1
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {column.sortable !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Sort by ${column.label}, ${sort?.key === column.key && sort.direction === 1 ? "descending" : "ascending"}`}
                      onClick={() => {
                        const nextSort: DataSort = {
                          key: column.key,
                          direction:
                            sort?.key === column.key && sort.direction === 1
                              ? -1
                              : 1,
                        };
                        if (controlledSort === undefined)
                          setInternalSort(nextSort);
                        onSortChange?.(nextSort);
                        setPage(1);
                      }}
                    >
                      {column.label}
                      {sort?.key === column.key ? (
                        sort.direction === 1 ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 19V5m-7 7 7-7 7 7" />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 5v14m-7-7 7 7 7-7" />
                          </svg>
                        )
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4" />
                        </svg>
                      )}
                    </Button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              filtered
                .slice((current - 1) * size, current * size)
                .map((row, index) => (
                  <tr
                    key={
                      getRowKey?.(row, (current - 1) * size + index) ??
                      row.id ??
                      (current - 1) * size + index
                    }
                  >
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
            {(loading || !filtered.length) && (
              <tr>
                <td colSpan={Math.max(1, columns.length)}>
                  {loading ? loadingMessage : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="cr-data-table-footer">
        <p className="cr-description" role="status">
          {loading
            ? loadingMessage
            : filtered.length
              ? `${(current - 1) * size + 1}–${Math.min(current * size, filtered.length)} of ${filtered.length} records`
              : "0 records"}
        </p>
        <Pagination
          label={`${caption} pages`}
          page={current}
          totalPages={total}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>
    </div>
  );
}
