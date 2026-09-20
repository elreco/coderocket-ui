"use client";
import { Slider as Base } from "@base-ui/react/slider";
import { cx } from "./utils";
export type SliderProps<
  Value extends number | readonly number[] = number | readonly number[],
> = Omit<Base.Root.Props<Value>, "className" | "children"> & {
  label: string;
  className?: string;
  thumbLabels?: readonly string[];
};
export function Slider<Value extends number | readonly number[]>({
  label,
  className,
  thumbLabels,
  locale = "en-US",
  ...props
}: SliderProps<Value>) {
  const initialValue = props.value ?? props.defaultValue;
  const thumbCount = Array.isArray(initialValue) ? initialValue.length : 1;
  return (
    <Base.Root
      {...props}
      locale={locale}
      className={cx("cr-slider", className)}
    >
      <div className="cr-row">
        <Base.Label className="cr-label">{label}</Base.Label>
        <Base.Value className="cr-description" />
      </div>
      <Base.Control className="cr-slider-control">
        <Base.Track className="cr-slider-track">
          <Base.Indicator className="cr-slider-indicator" />
          {Array.from({ length: thumbCount }, (_, index) => (
            <Base.Thumb
              key={index}
              index={index}
              className="cr-slider-thumb"
              aria-label={
                thumbLabels?.[index] ??
                (thumbCount === 1
                  ? label
                  : `${label}, ${index + 1} of ${thumbCount}`)
              }
            />
          ))}
        </Base.Track>
      </Base.Control>
    </Base.Root>
  );
}
