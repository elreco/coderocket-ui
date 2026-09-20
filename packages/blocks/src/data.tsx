"use client";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  ChevronRight,
  FileText,
  FolderPlus,
  ListFilter,
  Minus,
  Pencil,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  Input,
  Select,
  Separator,
} from "@coderocket/react";

function DataHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="cr-workspace-heading">
      <div>
        <span className="cr-workspace-eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="cr-workspace-heading-action">{action}</div>}
    </header>
  );
}

export function DataTableBlock({
  title,
  description,
  columns,
  rows,
  onCreate,
}: {
  title: string;
  description?: string;
  columns: ComponentProps<typeof DataTable>["columns"];
  rows: ComponentProps<typeof DataTable>["rows"];
  onCreate: () => void;
}) {
  return (
    <Card className="cr-workspace-block cr-workspace-data-table">
      <DataHeading
        eyebrow="Workspace data"
        title={title}
        description={description}
        action={
          <Button onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            Add record
          </Button>
        }
      />
      <div className="cr-workspace-list-heading">
        <span>All records</span>
        <Badge variant="outline">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </Badge>
      </div>
      <DataTable caption={title} columns={columns} rows={rows} />
    </Card>
  );
}

export function FiltersBlock({
  onChange,
  statuses,
}: {
  onChange: (filters: { query: string; status: string }) => void;
  statuses: Array<{ value: string; label: string }>;
}) {
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all");
  const active = Number(Boolean(query)) + Number(status !== "all");
  return (
    <Card className="cr-workspace-block cr-workspace-filter-block">
      <div className="cr-workspace-filter-heading">
        <span>
          <ListFilter size={17} aria-hidden="true" />
          <strong>Filter records</strong>
        </span>
        {active > 0 && <Badge variant="outline">{active} active</Badge>}
      </div>
      <div className="cr-block-filters cr-workspace-filters">
        <Field label="Search">
          <div className="cr-workspace-search-field">
            <Search size={17} aria-hidden="true" />
            <Input
              type="search"
              value={query}
              placeholder="Name or keyword…"
              onChange={(event) => {
                setQuery(event.target.value);
                onChange({ query: event.target.value, status });
              }}
            />
          </div>
        </Field>
        <Field label="Status">
          <Select
            label="Status"
            value={status}
            options={[
              { value: "all", label: "All statuses" },
              ...statuses.filter((item) => item.value !== "all"),
            ]}
            onValueChange={(value) => {
              const next = value ?? "all";
              setStatus(next);
              onChange({ query, status: next });
            }}
          />
        </Field>
        <Button
          variant="ghost"
          disabled={!active}
          onClick={() => {
            setQuery("");
            setStatus("all");
            onChange({ query: "", status: "all" });
          }}
        >
          <X size={15} aria-hidden="true" />
          Clear filters
        </Button>
      </div>
    </Card>
  );
}

export function SearchBlock({
  items,
  onSelect,
}: {
  items: Array<{ id: string; title: string; description: string }>;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  return (
    <Card className="cr-workspace-block cr-workspace-search-block">
      <DataHeading
        eyebrow="Workspace search"
        title="Find your next step"
        description="Documents, projects and ideas. Right where you need them."
      />
      <div className="cr-workspace-search-field">
        <Search size={18} aria-hidden="true" />
        <Input
          aria-label="Search content"
          type="search"
          value={query}
          placeholder="Search your workspace…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="cr-workspace-list-heading">
        <span>{query ? "Matching results" : "All items"}</span>
        <span className="cr-description" role="status">
          {results.length} {results.length === 1 ? "result" : "results"}
        </span>
      </div>
      <ul className="cr-workspace-list cr-workspace-search-results">
        {results.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="cr-notification-item cr-workspace-search-result"
              onClick={() => onSelect(item.id)}
            >
              <span className="cr-workspace-icon-tile">
                <FileText size={18} aria-hidden="true" />
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className="cr-description">{item.description}</span>
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {!results.length && (
        <div className="cr-workspace-caught-up">
          <span className="cr-workspace-icon-tile">
            <SearchX size={22} aria-hidden="true" />
          </span>
          <strong>No results found</strong>
          <p>Try a different name or keyword.</p>
        </div>
      )}
    </Card>
  );
}

export function EmptyStateBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card className="cr-workspace-block cr-workspace-empty-block">
      <EmptyState
        title={title}
        description={description}
        icon={
          <span className="cr-workspace-empty-illustration">
            <span />
            <span />
            <span>
              <FolderPlus size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </span>
        }
        action={
          <Button onClick={onAction}>
            <Plus size={16} aria-hidden="true" />
            {actionLabel}
          </Button>
        }
      />
    </Card>
  );
}

export function DetailViewBlock({
  title,
  status,
  fields,
  children,
  onEdit,
}: {
  title: string;
  status: string;
  fields: Array<{ label: string; value: string }>;
  children?: ReactNode;
  onEdit: () => void;
}) {
  return (
    <Card className="cr-workspace-block cr-workspace-detail">
      <DataHeading
        eyebrow="Record overview"
        title={title}
        action={
          <Button variant="outline" onClick={onEdit}>
            <Pencil size={15} aria-hidden="true" />
            Edit details
          </Button>
        }
      />
      <div className="cr-workspace-detail-status">
        <span>Status</span>
        <Badge variant="outline">
          <span className="cr-workspace-status-dot" aria-hidden="true" />
          {status}
        </Badge>
      </div>
      <dl className="cr-details cr-workspace-details">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      {children && (
        <div className="cr-workspace-detail-content">
          <Separator />
          {children}
        </div>
      )}
    </Card>
  );
}

export function StatsBlock({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: "positive" | "negative" | "neutral";
    description?: string;
    icon?: ReactNode;
  }>;
}) {
  return (
    <div className="cr-block-grid cr-workspace-stats">
      {items.map((item) => (
        <Card className="cr-workspace-stat-card" key={item.label}>
          <div className="cr-workspace-stat-heading">
            <span>{item.label}</span>
            <span className="cr-workspace-stat-icon" aria-hidden="true">
              {item.icon ?? <ChartNoAxesColumn size={17} />}
            </span>
          </div>
          <strong className="cr-stat-value">{item.value}</strong>
          {(item.change || item.description) && (
            <div className="cr-workspace-stat-footer">
              {item.change && (
                <Badge
                  variant="outline"
                  className="cr-workspace-stat-change"
                  data-trend={item.trend ?? "neutral"}
                >
                  {item.trend === "positive" ? (
                    <ArrowUpRight size={13} aria-hidden="true" />
                  ) : item.trend === "negative" ? (
                    <ArrowDownRight size={13} aria-hidden="true" />
                  ) : (
                    <Minus size={13} aria-hidden="true" />
                  )}
                  {item.change}
                </Badge>
              )}
              {item.description && <span>{item.description}</span>}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
