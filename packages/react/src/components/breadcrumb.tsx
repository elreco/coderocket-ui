"use client";
export function Breadcrumb({
  items,
  label = "Breadcrumb",
}: {
  items: Array<{ label: string; href?: string }>;
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="cr-breadcrumb">
        {items.map((item, index) => (
          <li key={index}>
            {index > 0 && (
              <svg
                className="cr-breadcrumb-separator"
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
                <path d="m9 6 6 6-6 6" />
              </svg>
            )}
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
