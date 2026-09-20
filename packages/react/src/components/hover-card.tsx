"use client";
import { PreviewCard as Base } from "@base-ui/react/preview-card";
import type { ComponentProps, ReactNode } from "react";
import { usePortalContainer } from "./utils";
export function HoverCard({
  label,
  href,
  children,
  side = "bottom",
  align = "start",
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  label: string;
  href: string;
  children: ReactNode;
  side?: ComponentProps<typeof Base.Positioner>["side"];
  align?: ComponentProps<typeof Base.Positioner>["align"];
}) {
  const container = usePortalContainer();
  return (
    <Base.Root {...rootProps}>
      <Base.Trigger href={href} className="cr-link">
        {label}
      </Base.Trigger>
      <Base.Portal container={container}>
        <Base.Positioner
          side={side}
          align={align}
          sideOffset={8}
          className="cr-positioner"
        >
          <Base.Popup className="cr-popup cr-hover-card">{children}</Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
