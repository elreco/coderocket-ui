import type { DisplayContent } from "../components/display-types";
export type FormAction = (values: FormData) => void | Promise<void>;
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface SidebarItem {
  label: string;
  href: string;
  icon?: DisplayContent;
  active?: boolean;
}
