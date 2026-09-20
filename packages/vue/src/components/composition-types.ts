/** Portable composition types; exported Vue files do not require the studio packages. */
export interface CompositionNode {
  id: string;
  parent: string | null;
  kind:
    | "stack"
    | "row"
    | "grid"
    | "card"
    | "form"
    | "heading"
    | "text"
    | "button"
    | "badge"
    | "separator"
    | "input"
    | "textarea"
    | "checkbox"
    | "switch"
    | "select"
    | "progress"
    | "avatar"
    | "file-upload";
  text: string;
  description: string;
  name?: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "success"
    | "warning";
  inputType?: "text" | "email" | "password" | "number" | "url" | "tel";
  required?: boolean;
  options?: { value: string; label: string }[];
  action?: string;
  value?: number;
  columns?: number;
}
export interface Composition {
  schemaVersion: 1;
  name: string;
  slug: string;
  kind: "component" | "block";
  description: string;
  nodes: CompositionNode[];
}
export type CompositionAction = (
  action: string,
  values?: Record<string, FormDataEntryValue>,
) => void | Promise<void>;
