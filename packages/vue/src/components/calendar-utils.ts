import {
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  type VNodeChild,
} from "vue";

/** Values are Gregorian calendar dates, never timestamps or local-midnight instants. */
export type DateRange = { start: string; end: string };
export type DisabledDates = readonly string[] | ((date: string) => boolean);
export type CalendarLabels = {
  previousMonth: string;
  nextMonth: string;
  month: string;
  year: string;
  week: string;
  chooseDate: string;
  chooseRange: string;
  chooseEnd: string;
  unavailableRange: string;
  today: string;
  yesterday: string;
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastMonth: string;
  clear: string;
  apply: string;
  cancel: string;
  close: string;
  startDate: string;
  endDate: string;
  invalidDate: string;
};
export function calendarLabels(
  locale = "en",
  overrides?: Partial<CalendarLabels>,
): CalendarLabels {
  return {
    ...(locale.toLowerCase().startsWith("fr")
      ? {
          previousMonth: "Mois précédent",
          nextMonth: "Mois suivant",
          month: "Mois",
          year: "Année",
          week: "Semaine",
          chooseDate: "Choisir une date",
          chooseRange: "Choisir une période",
          chooseEnd: "Choisissez la date de fin.",
          unavailableRange: "Cette période contient une date indisponible.",
          today: "Aujourd’hui",
          yesterday: "Hier",
          last7Days: "7 derniers jours",
          last30Days: "30 derniers jours",
          thisMonth: "Ce mois-ci",
          lastMonth: "Le mois dernier",
          clear: "Effacer",
          apply: "Appliquer",
          cancel: "Annuler",
          close: "Fermer le calendrier",
          startDate: "Date de début",
          endDate: "Date de fin",
          invalidDate: "Choisissez une date ou une période disponible.",
        }
      : {
          previousMonth: "Previous month",
          nextMonth: "Next month",
          month: "Month",
          year: "Year",
          week: "Week",
          chooseDate: "Choose a date",
          chooseRange: "Choose a date range",
          chooseEnd: "Choose the end date.",
          unavailableRange: "This range contains an unavailable date.",
          today: "Today",
          yesterday: "Yesterday",
          last7Days: "Last 7 days",
          last30Days: "Last 30 days",
          thisMonth: "This month",
          lastMonth: "Last month",
          clear: "Clear",
          apply: "Apply",
          cancel: "Cancel",
          close: "Close calendar",
          startDate: "Start date",
          endDate: "End date",
          invalidDate: "Choose an available date or date range.",
        }),
    ...overrides,
  };
}
export function parseCalendarDate(iso: string): Date {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
    iso < "0001-01-01" ||
    iso > "9999-12-31"
  )
    throw new Error("Expected an ISO calendar date");
  const date = new Date(`${iso}T12:00:00Z`);
  if (
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== iso
  )
    throw new Error("Invalid calendar date");
  return date;
}
export function calendarISO(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function calendarToday() {
  const now = new Date();
  return `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
/** Defer local-day features until mounting so server and hydration output match. */
export function useCalendarToday() {
  const today = ref("");
  let timer: ReturnType<typeof setInterval> | undefined;
  const refresh = () => {
    today.value = calendarToday();
  };
  onMounted(() => {
    refresh();
    timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
  });
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
    if (typeof window !== "undefined")
      window.removeEventListener("focus", refresh);
  });
  return readonly(today);
}
export function addCalendarDays(value: string, amount: number) {
  const date = parseCalendarDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.getUTCFullYear() < 1
    ? "0001-01-01"
    : date.getUTCFullYear() > 9999
      ? "9999-12-31"
      : calendarISO(date);
}
export function startOfCalendarMonth(value: string) {
  return value.slice(0, 7) + "-01";
}
export function addCalendarMonths(value: string, amount: number) {
  const date = parseCalendarDate(value),
    day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  if (date.getUTCFullYear() < 1) return "0001-01-01";
  if (date.getUTCFullYear() > 9999) return "9999-12-31";
  const last = new Date(date);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  date.setUTCDate(Math.min(day, last.getUTCDate()));
  return calendarISO(date);
}
export function endOfCalendarMonth(value: string) {
  const date = parseCalendarDate(value);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return calendarISO(date);
}
export function isoWeekNumber(value: string) {
  const date = parseCalendarDate(value);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const first = new Date(date);
  first.setUTCMonth(0, 1);
  return Math.ceil(((date.valueOf() - first.valueOf()) / 86400000 + 1) / 7);
}
export function isCalendarDateDisabled(
  value: string,
  options: { min?: string; max?: string; disabledDates?: DisabledDates } = {},
) {
  return (
    value < (options.min ?? "0001-01-01") ||
    value > (options.max ?? "9999-12-31") ||
    (typeof options.disabledDates === "function"
      ? options.disabledDates(value)
      : (options.disabledDates?.includes(value) ?? false))
  );
}
export function isCalendarRangeAvailable(
  range: DateRange,
  options: {
    min?: string;
    max?: string;
    disabledDates?: DisabledDates;
    excludeDisabled?: boolean;
  } = {},
) {
  try {
    parseCalendarDate(range.start);
    parseCalendarDate(range.end);
  } catch {
    return false;
  }
  if (
    range.start > range.end ||
    isCalendarDateDisabled(range.start, options) ||
    isCalendarDateDisabled(range.end, options)
  )
    return false;
  if (!options.disabledDates || options.excludeDisabled === false) return true;
  if (Array.isArray(options.disabledDates))
    return !options.disabledDates.some(
      (date) => date >= range.start && date <= range.end,
    );
  for (
    let date = range.start;
    date < range.end;
    date = addCalendarDays(date, 1)
  )
    if (isCalendarDateDisabled(date, options)) return false;
  return true;
}

export type CalendarValue = string | DateRange | null;
export interface CalendarBaseProps {
  label?: string;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  disabledDates?: DisabledDates;
  excludeDisabled?: boolean;
  startFrom?: string;
  numberOfMonths?: 1 | 2;
  showWeekNumbers?: boolean;
  weekdayFormat?: "narrow" | "short" | "long";
  monthSelection?: boolean;
  labels?: Partial<CalendarLabels>;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  className?: string;
  renderDay?: (date: string) => VNodeChild;
}
export interface CalendarProps extends CalendarBaseProps {
  mode?: "single" | "range";
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
}
export type DatePickerShortcut = {
  label: string;
  value: string | DateRange | (() => string | DateRange);
};
export interface DatePickerProps extends CalendarProps {
  name?: string;
  form?: string;
  placeholder?: string;
  separator?: string;
  autoApply?: boolean;
  inline?: boolean;
  overlay?: boolean;
  /** Space to keep between the popup and viewport edges. */
  collisionPadding?:
    number | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  clearable?: boolean;
  showInputs?: boolean;
  shortcuts?: boolean | readonly DatePickerShortcut[];
  formatDate?: (date: string, locale: string) => string;
  dateFormat?: Intl.DateTimeFormatOptions;
  triggerClassName?: string;
  icon?: VNodeChild;
  renderTrigger?: (value: string, placeholder: string) => VNodeChild;
  open?: boolean;
}
