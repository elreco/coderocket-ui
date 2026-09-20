"use client";
import { Tooltip as Base } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactNode } from "react";
import { usePortalContainer } from "./utils";
export function Tooltip({
  trigger,
  triggerRender,
  content,
  side = "top",
  align = "center",
  delay,
  ...rootProps
}: Omit<ComponentProps<typeof Base.Root>, "children"> & {
  trigger?: ReactNode;
  triggerRender?: ComponentProps<typeof Base.Trigger>["render"];
  content: ReactNode;
  side?: ComponentProps<typeof Base.Positioner>["side"];
  align?: ComponentProps<typeof Base.Positioner>["align"];
  delay?: ComponentProps<typeof Base.Provider>["delay"];
}) {
  const container = usePortalContainer();
  return (
    <Base.Provider delay={delay}>
      <Base.Root {...rootProps}>
        <Base.Trigger
          render={triggerRender}
          className="cr-button"
          data-variant="outline"
        >
          {trigger}
        </Base.Trigger>
        <Base.Portal container={container}>
          <Base.Positioner
            side={side}
            align={align}
            sideOffset={6}
            className="cr-positioner"
          >
            <Base.Popup className="cr-tooltip">
              {content}
              <Base.Arrow />
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </Base.Provider>
  );
}
