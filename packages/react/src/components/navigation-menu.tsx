"use client";
import { NavigationMenu as Base } from "@base-ui/react/navigation-menu";
import { usePortalContainer } from "./utils";
export function NavigationMenu({
  label = "Main navigation",
  items,
  value,
  defaultValue,
  onValueChange,
}: {
  label?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  items: Array<{
    value?: string;
    label: string;
    links: Array<{
      label: string;
      href: string;
      description?: string;
      active?: boolean;
    }>;
  }>;
}) {
  const container = usePortalContainer();
  return (
    <Base.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className="cr-navigation"
      aria-label={label}
    >
      <Base.List className="cr-navigation-list">
        {items.map((item, index) => (
          <Base.Item
            key={item.value ?? index}
            value={item.value ?? String(index)}
          >
            <Base.Trigger className="cr-button" data-variant="ghost">
              {item.label}{" "}
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
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Base.Trigger>
            <Base.Content className="cr-navigation-content">
              {item.links.map((link) => (
                <Base.Link
                  key={link.href}
                  href={link.href}
                  active={link.active}
                  closeOnClick
                  className="cr-navigation-link"
                >
                  <strong>{link.label}</strong>
                  {link.description && <span>{link.description}</span>}
                </Base.Link>
              ))}
            </Base.Content>
          </Base.Item>
        ))}
      </Base.List>
      <Base.Portal container={container}>
        <Base.Positioner sideOffset={8} className="cr-positioner">
          <Base.Popup className="cr-popup">
            <Base.Viewport />
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
