"use client";
import {
  useRef,
  useState,
  useEffect,
  useEffectEvent,
  type ReactNode,
} from "react";
import { Popover as Base } from "@base-ui/react/popover";
import { CalendarDays, X } from "lucide-react";
import {
  Calendar,
  parseCalendarDate,
  calendarLabels,
  useCalendarToday,
  addCalendarDays,
  addCalendarMonths,
  startOfCalendarMonth,
  endOfCalendarMonth,
  isCalendarDateDisabled,
  isCalendarRangeAvailable,
  type CalendarBaseProps,
  type DateRange,
} from "./calendar";
import { Button } from "./button";
import { cx, usePortalContainer } from "./utils";

type PickerValue = string | DateRange | null;
export type DatePickerShortcut = {
  label: string;
  value: string | DateRange | (() => string | DateRange);
};
export type DatePickerProps = CalendarBaseProps & {
  name?: string;
  form?: string;
  placeholder?: string;
  separator?: string;
  autoApply?: boolean;
  inline?: boolean;
  overlay?: boolean;
  clearable?: boolean;
  showInputs?: boolean;
  shortcuts?: boolean | readonly DatePickerShortcut[];
  formatDate?: (date: string, locale: string) => string;
  dateFormat?: Intl.DateTimeFormatOptions;
  triggerClassName?: string;
  icon?: ReactNode;
  renderTrigger?: (value: string, placeholder: string) => ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & (
    | {
        mode?: "single";
        value?: string | null;
        defaultValue?: string;
        onValueChange?: (date: string) => void;
      }
    | {
        mode: "range";
        value?: DateRange | null;
        defaultValue?: DateRange;
        onValueChange?: (range: DateRange | null) => void;
      }
  );

export function DatePicker(props: DatePickerProps) {
  const {
    locale = "en",
    disabled = false,
    autoApply = true,
    inline = false,
    overlay = false,
    clearable = true,
    showInputs = true,
    shortcuts = true,
    separator = " – ",
    name,
    className,
    triggerClassName,
  } = props;
  const labels = calendarLabels(locale, props.labels),
    label =
      props.label ??
      (props.mode === "range" ? labels.chooseRange : labels.chooseDate);
  const placeholder = props.placeholder ?? label,
    container = usePortalContainer();
  const root = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<PickerValue>(
      props.defaultValue ?? null,
    ),
    [internalOpen, setInternalOpen] = useState(false);
  const chosen: PickerValue =
    props.value !== undefined ? props.value : internal;
  const [selectionPending, setSelectionPending] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [draft, setDraft] = useState<PickerValue>(chosen),
    [error, setError] = useState("");
  const getStart = (value: PickerValue) =>
    typeof value === "string" ? value : (value?.start ?? "");
  const getEnd = (value: PickerValue) =>
    typeof value === "object" && value ? value.end : "";
  const [startInput, setStartInput] = useState(getStart(chosen)),
    [endInput, setEndInput] = useState(getEnd(chosen));
  const synchronize = useEffectEvent(() => {
    setDraft(chosen);
    setStartInput(getStart(chosen));
    setEndInput(getEnd(chosen));
    setError("");
  });
  const chosenStart = getStart(chosen),
    chosenEnd = getEnd(chosen);
  useEffect(() => {
    synchronize();
  }, [chosenStart, chosenEnd]);
  const resetForm = useEffectEvent(() => {
    const next =
      props.value === undefined ? (props.defaultValue ?? null) : props.value;
    if (props.value === undefined) setInternal(next);
    setDraft(next);
    setStartInput(getStart(next));
    setEndInput(getEnd(next));
    setSelectionPending(false);
    setCalendarKey((current) => current + 1);
    setError("");
    if (props.open === undefined) setInternalOpen(false);
    props.onOpenChange?.(false);
  });
  useEffect(() => {
    const form = props.form
      ? document.getElementById(props.form)
      : root.current?.closest("form");
    if (!(form instanceof HTMLFormElement)) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) resetForm();
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [props.form]);
  const open = (props.open ?? internalOpen) && !disabled;
  function setOpen(next: boolean) {
    if (next && disabled) return;
    if (props.open === undefined) setInternalOpen(next);
    if (next) {
      setDraft(chosen);
      setStartInput(getStart(chosen));
      setEndInput(getEnd(chosen));
      setError("");
    }
    props.onOpenChange?.(next);
  }
  const options = {
    min: props.min,
    max: props.max,
    disabledDates: props.disabledDates,
    excludeDisabled: props.excludeDisabled,
  };
  function valid(value: PickerValue) {
    if (!value) return true;
    if (typeof value === "object")
      return props.mode === "range" && isCalendarRangeAvailable(value, options);
    try {
      parseCalendarDate(value);
    } catch {
      return false;
    }
    return props.mode !== "range" && !isCalendarDateDisabled(value, options);
  }
  function commit(value: PickerValue) {
    if (disabled || !valid(value)) return;
    if (props.value === undefined) setInternal(value);
    if (props.mode === "range")
      props.onValueChange?.(value && typeof value === "object" ? value : null);
    else props.onValueChange?.(typeof value === "string" ? value : "");
  }
  function select(value: PickerValue, close = true, resetCalendar = false) {
    if (disabled) return;
    if (!valid(value)) {
      setError(labels.invalidDate);
      return;
    }
    const visibleValue =
      autoApply && props.value !== undefined ? chosen : value;
    setDraft(visibleValue);
    setSelectionPending(false);
    if (resetCalendar) setCalendarKey((current) => current + 1);
    setStartInput(getStart(visibleValue));
    setEndInput(getEnd(visibleValue));
    setError("");
    if (autoApply) {
      commit(value);
      if (!inline && close) setOpen(false);
    }
  }
  function edit(start: string, end: string) {
    setStartInput(start);
    setEndInput(end);
    const next =
      props.mode === "range" ? (start && end ? { start, end } : null) : start;
    if ((props.mode === "range" && !!start !== !!end) || !valid(next)) {
      setError(labels.invalidDate);
      return;
    }
    setError("");
    setDraft(next);
    setSelectionPending(false);
    setCalendarKey((current) => current + 1);
    if (autoApply) commit(next);
  }
  function finishInput() {
    if (autoApply && props.value !== undefined && !error) {
      setStartInput(getStart(chosen));
      setEndInput(getEnd(chosen));
    }
  }
  const format = (date: string) =>
    props.formatDate?.(date, locale) ??
    new Intl.DateTimeFormat(
      locale,
      props.dateFormat
        ? { ...props.dateFormat, timeZone: "UTC", calendar: "gregory" }
        : { dateStyle: "medium", timeZone: "UTC", calendar: "gregory" },
    ).format(parseCalendarDate(date));
  const display = chosen
    ? typeof chosen === "string"
      ? format(chosen)
      : `${format(chosen.start)}${separator}${format(chosen.end)}`
    : "";
  const localToday = useCalendarToday();
  const today = localToday || "1970-01-01",
    yesterday = addCalendarDays(today, -1),
    thisMonth = startOfCalendarMonth(today),
    lastMonth = startOfCalendarMonth(addCalendarMonths(today, -1));
  const defaults: DatePickerShortcut[] =
    props.mode === "range"
      ? [
          { label: labels.today, value: { start: today, end: today } },
          {
            label: labels.yesterday,
            value: { start: yesterday, end: yesterday },
          },
          {
            label: labels.last7Days,
            value: { start: addCalendarDays(today, -6), end: today },
          },
          {
            label: labels.last30Days,
            value: { start: addCalendarDays(today, -29), end: today },
          },
          {
            label: labels.thisMonth,
            value: { start: thisMonth, end: endOfCalendarMonth(today) },
          },
          {
            label: labels.lastMonth,
            value: { start: lastMonth, end: endOfCalendarMonth(lastMonth) },
          },
        ]
      : [
          { label: labels.today, value: today },
          { label: labels.yesterday, value: yesterday },
        ];
  const items = Array.isArray(shortcuts)
    ? shortcuts
    : shortcuts
      ? defaults
      : [];
  const common: CalendarBaseProps = {
    label,
    min: props.min,
    max: props.max,
    locale,
    weekStartsOn: props.weekStartsOn,
    disabled,
    disabledDates: props.disabledDates,
    excludeDisabled: props.excludeDisabled,
    startFrom: props.startFrom,
    numberOfMonths: props.numberOfMonths,
    showWeekNumbers: props.showWeekNumbers,
    weekdayFormat: props.weekdayFormat,
    monthSelection: props.monthSelection,
    labels: props.labels,
    previousMonthLabel: props.previousMonthLabel,
    nextMonthLabel: props.nextMonthLabel,
    renderDay: props.renderDay,
    onMonthChange: props.onMonthChange,
    onSelectionPendingChange: (pending) => {
      setSelectionPending(pending);
      props.onSelectionPendingChange?.(pending);
    },
  };
  const fields =
    name &&
    (props.mode === "range" ? (
      <>
        <input
          type="hidden"
          form={props.form}
          name={`${name}[start]`}
          value={getStart(chosen)}
          disabled={disabled}
        />
        <input
          type="hidden"
          form={props.form}
          name={`${name}[end]`}
          value={getEnd(chosen)}
          disabled={disabled}
        />
      </>
    ) : (
      <input
        type="hidden"
        form={props.form}
        name={name}
        value={getStart(chosen)}
        disabled={disabled}
      />
    ));
  const calendarValue = autoApply ? chosen : draft;
  const content = (
    <>
      <div className="cr-date-picker-body">
        {items.length > 0 && (
          <div className="cr-date-picker-shortcuts" aria-label={label}>
            {items.map((item, index) => {
              const value =
                typeof item.value === "function" ? item.value() : item.value;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  disabled={
                    disabled ||
                    (!localToday && !Array.isArray(shortcuts)) ||
                    !valid(value)
                  }
                  onClick={() => select(value, true, true)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        )}
        {showInputs && (
          <div className="cr-date-picker-inputs">
            <label>
              <span>{props.mode === "range" ? labels.startDate : label}</span>
              <input
                type="date"
                onBlur={finishInput}
                value={startInput}
                min={props.min ?? "0001-01-01"}
                max={props.max ?? "9999-12-31"}
                disabled={disabled}
                aria-invalid={!!error || undefined}
                onChange={(event) => edit(event.target.value, endInput)}
              />
            </label>
            {props.mode === "range" && (
              <label>
                <span>{labels.endDate}</span>
                <input
                  type="date"
                  onBlur={finishInput}
                  value={endInput}
                  min={startInput || props.min || "0001-01-01"}
                  max={props.max ?? "9999-12-31"}
                  disabled={disabled}
                  aria-invalid={!!error || undefined}
                  onChange={(event) => edit(startInput, event.target.value)}
                />
              </label>
            )}
          </div>
        )}
        <div>
          {props.mode === "range" ? (
            <Calendar
              {...common}
              key={calendarKey}
              mode="range"
              value={
                calendarValue && typeof calendarValue === "object"
                  ? calendarValue
                  : null
              }
              onValueChange={select}
            />
          ) : (
            <Calendar
              {...common}
              key={calendarKey}
              value={typeof calendarValue === "string" ? calendarValue : null}
              onValueChange={select}
            />
          )}
        </div>
        {error && (
          <p className="cr-date-picker-error" role="alert">
            {error}
          </p>
        )}
      </div>
      {(clearable || !autoApply) && (
        <div className="cr-date-picker-footer">
          {clearable && (
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled || (!startInput && !endInput)}
              onClick={() =>
                select(props.mode === "range" ? null : "", false, true)
              }
            >
              {labels.clear}
            </Button>
          )}
          {!autoApply && (
            <div className="cr-date-picker-actions">
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setDraft(chosen);
                  setSelectionPending(false);
                  setCalendarKey((current) => current + 1);
                  setStartInput(getStart(chosen));
                  setEndInput(getEnd(chosen));
                  setError("");
                  if (!inline) setOpen(false);
                }}
              >
                {labels.cancel}
              </Button>
              <Button
                size="sm"
                disabled={
                  disabled || selectionPending || !!error || !valid(draft)
                }
                onClick={() => {
                  commit(draft);
                  if (!inline) setOpen(false);
                }}
              >
                {labels.apply}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
  if (inline)
    return (
      <div
        ref={root}
        className={cx("cr-date-picker cr-date-picker-inline", className)}
        role="group"
        aria-label={label}
      >
        {fields}
        {content}
      </div>
    );
  return (
    <div ref={root} className={cx("cr-date-picker", className)}>
      {fields}
      <Base.Root
        open={open}
        onOpenChange={setOpen}
        modal={overlay ? true : "trap-focus"}
      >
        <Base.Trigger
          className={cx("cr-button cr-date-picker-trigger", triggerClassName)}
          data-variant="outline"
          disabled={disabled}
          aria-label={`${label}${display ? `: ${display}` : ""}`}
        >
          {props.renderTrigger ? (
            props.renderTrigger(display, placeholder)
          ) : (
            <>
              <span data-placeholder={!display || undefined}>
                {display || placeholder}
              </span>
              {props.icon ?? <CalendarDays size={16} aria-hidden="true" />}
            </>
          )}
        </Base.Trigger>
        <Base.Portal container={container}>
          {overlay && <Base.Backdrop className="cr-date-picker-backdrop" />}
          <Base.Positioner
            sideOffset={8}
            collisionPadding={16}
            collisionAvoidance={{ side: "shift", align: "shift" }}
            className="cr-positioner cr-date-picker-positioner"
          >
            <Base.Popup
              className="cr-popup cr-date-picker-popup"
              // Focus the first control (Close), keeping month controls visible on opening.
              initialFocus={true}
            >
              <div className="cr-date-picker-heading">
                <Base.Title>{label}</Base.Title>
                <Base.Close
                  className="cr-date-picker-close"
                  aria-label={labels.close}
                >
                  <X size={16} aria-hidden="true" />
                </Base.Close>
              </div>
              {content}
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </div>
  );
}
