import type { Component, Ref, VNodeChild } from "vue";
export type DisplayContent = VNodeChild;
export type FocusTarget =
  | HTMLElement
  | Ref<HTMLElement | null | undefined>
  | (() => HTMLElement | null | undefined)
  | boolean;
export interface OverlayProps {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  trigger?: DisplayContent;
  triggerRender?: Component;
  title: string;
  description?: string;
  footer?: DisplayContent;
  closeLabel?: string;
  className?: string;
  initialFocus?: FocusTarget;
  finalFocus?: FocusTarget;
  disabled?: boolean;
  keepMounted?: boolean;
}
export interface MenuAction {
  id?: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
}
export interface CommandItem {
  value: string;
  label: string;
  description?: string;
  onSelect?: () => void;
  disabled?: boolean;
}
export type DataRow = Record<string, string | number>;
export interface DataSort {
  key: string;
  direction: 1 | -1;
}
export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (
    value: string | number | undefined,
    row: Readonly<DataRow>,
  ) => DisplayContent;
}
