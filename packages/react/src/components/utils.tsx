"use client";
import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
const PortalContext = createContext<HTMLElement | null>(null);
export function ThemeScope({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div ref={setContainer} style={style} className={"cr-theme " + className}>
      <PortalContext.Provider value={container}>
        {children}
      </PortalContext.Provider>
    </div>
  );
}
export function usePortalContainer() {
  return useContext(PortalContext) ?? undefined;
}
export function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}
