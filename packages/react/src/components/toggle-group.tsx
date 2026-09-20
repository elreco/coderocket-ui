"use client";
import { ToggleGroup as Group } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { cx } from "./utils";
export type ToggleGroupProps<Value extends string = string> = Omit<
  Group.Props<Value>,
  "className" | "children"
> & {
  label: string;
  className?: string;
  items: Array<{ value: Value; label: string; disabled?: boolean }>;
};
export function ToggleGroup<Value extends string>({
  label,
  items,
  className,
  multiple = false,
  ...props
}: ToggleGroupProps<Value>) {
  return (
    <Group
      {...props}
      aria-label={label}
      multiple={multiple}
      className={cx("cr-toggle-group", className)}
    >
      {items.map((item) => (
        <Toggle
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="cr-toggle"
        >
          {item.label}
        </Toggle>
      ))}
    </Group>
  );
}
