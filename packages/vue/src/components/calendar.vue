<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import {
  addCalendarDays,
  addCalendarMonths,
  calendarISO,
  calendarLabels,
  endOfCalendarMonth,
  isCalendarDateDisabled,
  isCalendarRangeAvailable,
  isoWeekNumber,
  parseCalendarDate,
  startOfCalendarMonth,
  useCalendarToday,
  type CalendarProps,
  type CalendarValue,
} from "./calendar-utils";
import { cx } from "./utils";

const props = withDefaults(defineProps<CalendarProps>(), {
  mode: "single",
  min: "0001-01-01",
  max: "9999-12-31",
  locale: "en",
  weekStartsOn: 1,
  disabled: false,
  excludeDisabled: true,
  showWeekNumbers: false,
  weekdayFormat: "short",
  monthSelection: true,
});
const emit = defineEmits<{
  "update:modelValue": [value: CalendarValue];
  valueChange: [value: CalendarValue];
  monthChange: [month: string];
  selectionPendingChange: [pending: boolean];
}>();
const internal = ref<CalendarValue>(props.defaultValue ?? null);
const chosen = computed(() =>
  props.modelValue !== undefined ? props.modelValue : internal.value,
);
const selected = computed(() =>
  typeof chosen.value === "string" ? chosen.value || null : null,
);
const range = computed(() =>
  chosen.value && typeof chosen.value === "object" ? chosen.value : null,
);
const labels = computed(() => calendarLabels(props.locale, props.labels));
const label = computed(
  () =>
    props.label ??
    (props.mode === "range"
      ? labels.value.chooseRange
      : labels.value.chooseDate),
);
const monthCount = computed(
  () => props.numberOfMonths ?? (props.mode === "range" ? 2 : 1),
);
const today = useCalendarToday();
const focused = ref<string | null>(null);
const viewedMonth = ref<string | null>(null);
const anchor = ref<string | null>(null);
const hovered = ref<string | null>(null);
const status = ref("");
const grid = ref<HTMLDivElement>();
const headingId = useId();
const clamp = (value: string) =>
  value < props.min ? props.min : value > props.max ? props.max : value;
const focusDate = computed(
  () =>
    focused.value ??
    clamp(
      selected.value ??
        range.value?.start ??
        props.startFrom ??
        (today.value || "1970-01-01"),
    ),
);
const month = computed(
  () => viewedMonth.value ?? startOfCalendarMonth(focusDate.value),
);
const skeleton = computed(
  () => !today.value && !selected.value && !range.value && !props.startFrom,
);
const unavailable = (value: string) =>
  props.disabled || isCalendarDateDisabled(value, props);
const fullDate = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      dateStyle: "full",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const monthName = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      month: "long",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const completeMonth = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const minYear = computed(() => Number(props.min.slice(0, 4)));
const maxYear = computed(() => Number(props.max.slice(0, 4)));

watch(
  [
    () => props.min,
    () => props.max,
    selected,
    () => range.value?.start,
    () => range.value?.end,
    () => props.startFrom,
  ],
  () => {
    parseCalendarDate(props.min);
    parseCalendarDate(props.max);
    if (props.min > props.max) throw new Error("Calendar min exceeds max");
    if (selected.value) parseCalendarDate(selected.value);
    if (range.value) {
      parseCalendarDate(range.value.start);
      parseCalendarDate(range.value.end);
    }
    if (props.startFrom) parseCalendarDate(props.startFrom);
  },
  { immediate: true },
);

function cancelPendingSelection() {
  anchor.value = null;
  hovered.value = null;
  status.value = "";
  emit("selectionPendingChange", false);
}
watch(
  [
    selected,
    () => range.value?.start,
    () => range.value?.end,
    () => props.min,
    () => props.max,
    today,
    () => props.startFrom,
    () => props.mode,
  ],
  () => {
    if (skeleton.value) return;
    const next = clamp(selected.value ?? range.value?.start ?? focusDate.value);
    focused.value = next;
    viewedMonth.value = startOfCalendarMonth(next);
    cancelPendingSelection();
  },
);
defineExpose({ cancelPendingSelection });

const months = computed(() =>
  Array.from({ length: monthCount.value }, (_, index) =>
    startOfCalendarMonth(addCalendarMonths(month.value, index)),
  ).filter((value, index, all) => all.indexOf(value) === index),
);
const displayedRange = computed(() => {
  const end = hovered.value ?? focusDate.value;
  return anchor.value
    ? {
        start: anchor.value < end ? anchor.value : end,
        end: anchor.value < end ? end : anchor.value,
      }
    : range.value;
});
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const day = parseCalendarDate(
      addCalendarDays("2024-01-07", (index + props.weekStartsOn) % 7),
    );
    return {
      label: new Intl.DateTimeFormat(props.locale, {
        weekday: "long",
        timeZone: "UTC",
        calendar: "gregory",
      }).format(day),
      text: new Intl.DateTimeFormat(props.locale, {
        weekday: props.weekdayFormat,
        timeZone: "UTC",
        calendar: "gregory",
      }).format(day),
    };
  }),
);
const panels = computed(() =>
  months.value.map((current, monthIndex) => {
    const date = parseCalendarDate(current);
    const offset = (date.getUTCDay() - props.weekStartsOn + 7) % 7;
    return {
      current,
      monthIndex,
      headingId: `${headingId}-${monthIndex}`,
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      title: completeMonth.value.format(date),
      options: Array.from({ length: 12 }, (_, index) => {
        const option = new Date(date);
        option.setUTCMonth(index);
        const value = calendarISO(option);
        return {
          value: index,
          label: monthName.value.format(option),
          disabled: endOfCalendarMonth(value) < props.min || value > props.max,
        };
      }),
      weeks: Array.from({ length: 6 }, (_, week) => ({
        number: isoWeekNumber(
          addCalendarDays(
            current,
            week * 7 + ((4 - props.weekStartsOn + 7) % 7) - offset,
          ),
        ),
        days: Array.from({ length: 7 }, (_, index) => {
          const day = new Date(date);
          day.setUTCDate(1 - offset + week * 7 + index);
          const outside = day.getUTCMonth() !== date.getUTCMonth();
          if (
            day.getUTCFullYear() < 1 ||
            day.getUTCFullYear() > 9999 ||
            (months.value.length > 1 && outside)
          )
            return null;
          const iso = calendarISO(day);
          const inRange =
            !!displayedRange.value &&
            iso >= displayedRange.value.start &&
            iso <= displayedRange.value.end;
          const endpoint =
            iso === displayedRange.value?.start ||
            iso === displayedRange.value?.end;
          return {
            iso,
            day: day.getUTCDate(),
            outside,
            inRange,
            blocked: unavailable(iso),
            endpoint,
            selected:
              props.mode === "range"
                ? !anchor.value && inRange
                : selected.value === iso,
            label: fullDate.value.format(day),
          };
        }),
      })),
    };
  }),
);
const visibleDates = computed(() =>
  panels.value.flatMap((panel) =>
    panel.weeks.flatMap((week) =>
      week.days.flatMap((day) => (day ? [day.iso] : [])),
    ),
  ),
);
const tabDate = computed(() =>
  visibleDates.value.includes(focusDate.value) && !unavailable(focusDate.value)
    ? focusDate.value
    : visibleDates.value.find((date) => !unavailable(date)),
);
function focusButton(target: string) {
  void nextTick(() =>
    grid.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)
      ?.focus(),
  );
}
function changeMonth(next: string) {
  const target = clamp(next);
  focused.value = target;
  viewedMonth.value = startOfCalendarMonth(target);
  emit("monthChange", viewedMonth.value);
}
function changeMonthSelect(event: Event, current: string, index: number) {
  const next = parseCalendarDate(current);
  next.setUTCMonth(Number((event.target as HTMLSelectElement).value));
  changeMonth(addCalendarMonths(calendarISO(next), -index));
}
function changeYear(event: FocusEvent, current: string, index: number) {
  const input = event.target as HTMLInputElement;
  const year = Number(input.value),
    next = parseCalendarDate(current);
  if (!Number.isInteger(year) || year < minYear.value || year > maxYear.value) {
    input.value = String(next.getUTCFullYear());
    return;
  }
  next.setUTCFullYear(year);
  changeMonth(addCalendarMonths(calendarISO(next), -index));
}
function move(next: string, direction = 1) {
  let target = clamp(next),
    searched = 0;
  while (unavailable(target)) {
    // Bound arbitrary predicates so a fully disabled calendar cannot freeze input.
    if (++searched > 366) return;
    const candidate = addCalendarDays(target, direction);
    if (candidate === target || candidate < props.min || candidate > props.max)
      return;
    target = candidate;
  }
  focused.value = target;
  if (!visibleDates.value.includes(target)) {
    viewedMonth.value = startOfCalendarMonth(target);
    emit("monthChange", viewedMonth.value);
  }
  focusButton(target);
}
function keyboard(event: KeyboardEvent, date: string) {
  let next: string | undefined,
    direction = 1;
  const day =
    (parseCalendarDate(date).getUTCDay() - props.weekStartsOn + 7) % 7;
  if (event.key === "ArrowRight") next = addCalendarDays(date, 1);
  if (event.key === "ArrowLeft") {
    next = addCalendarDays(date, -1);
    direction = -1;
  }
  if (event.key === "ArrowDown") next = addCalendarDays(date, 7);
  if (event.key === "ArrowUp") {
    next = addCalendarDays(date, -7);
    direction = -1;
  }
  if (event.key === "Home") next = addCalendarDays(date, -day);
  if (event.key === "End") {
    next = addCalendarDays(date, 6 - day);
    direction = -1;
  }
  if (event.key === "PageUp" || event.key === "PageDown") {
    direction = event.key === "PageUp" ? -1 : 1;
    next = addCalendarMonths(date, direction * (event.shiftKey ? 12 : 1));
  }
  if (event.key === "Escape" && anchor.value) {
    event.preventDefault();
    event.stopPropagation();
    cancelPendingSelection();
  }
  if (next) {
    event.preventDefault();
    move(next, direction);
  }
}
function choose(date: string) {
  if (unavailable(date)) return;
  focused.value = date;
  status.value = "";
  let next: CalendarValue = date;
  if (props.mode === "range") {
    if (!anchor.value) {
      anchor.value = date;
      hovered.value = null;
      status.value = labels.value.chooseEnd;
      emit("selectionPendingChange", true);
      return;
    }
    next = {
      start: date < anchor.value ? date : anchor.value,
      end: date < anchor.value ? anchor.value : date,
    };
    if (!isCalendarRangeAvailable(next, props)) {
      status.value = labels.value.unavailableRange;
      return;
    }
    cancelPendingSelection();
  }
  if (props.modelValue === undefined) internal.value = next;
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function focusDay(date: string) {
  focused.value = date;
  if (anchor.value) hovered.value = date;
}
</script>

<template>
  <div
    v-if="skeleton"
    :class="cx('cr-calendar cr-calendar-skeleton', className)"
    role="status"
    :aria-label="label"
    aria-busy="true"
  >
    <div class="cr-calendar-months">
      <div
        v-for="index in monthCount"
        :key="index"
        class="cr-calendar-month"
        aria-hidden="true"
      >
        <span class="cr-calendar-skeleton-caption" />
        <div class="cr-calendar-skeleton-days">
          <span v-for="day in 42" :key="day" />
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    ref="grid"
    :class="cx('cr-calendar', className)"
    :data-months="months.length"
  >
    <div class="cr-calendar-navigation">
      <button
        type="button"
        class="cr-button"
        data-variant="ghost"
        data-size="sm"
        :aria-label="previousMonthLabel ?? labels.previousMonth"
        :disabled="disabled || month <= startOfCalendarMonth(min)"
        @click="changeMonth(addCalendarMonths(month, -1))"
      >
        <ChevronLeft :size="16" aria-hidden="true" />
      </button>
      <span :id="headingId" class="cr-sr-only" aria-live="polite">{{
        panels.map((panel) => panel.title).join(" – ")
      }}</span>
      <button
        type="button"
        class="cr-button"
        data-variant="ghost"
        data-size="sm"
        :aria-label="nextMonthLabel ?? labels.nextMonth"
        :disabled="
          disabled || months[months.length - 1]! >= startOfCalendarMonth(max)
        "
        @click="changeMonth(addCalendarMonths(month, 1))"
      >
        <ChevronRight :size="16" aria-hidden="true" />
      </button>
    </div>
    <div class="cr-calendar-months">
      <section
        v-for="panel in panels"
        :key="panel.monthIndex"
        class="cr-calendar-month"
      >
        <div class="cr-calendar-caption">
          <span :id="panel.headingId" class="cr-sr-only">{{
            panel.title
          }}</span>
          <template v-if="monthSelection">
            <select
              :aria-label="`${labels.month}${months.length > 1 ? ` ${panel.monthIndex + 1}` : ''}`"
              :value="panel.month"
              :disabled="disabled"
              @change="
                changeMonthSelect($event, panel.current, panel.monthIndex)
              "
            >
              <option
                v-for="option in panel.options"
                :key="option.value"
                :value="option.value"
                :disabled="option.disabled"
              >
                {{ option.label }}
              </option>
            </select>
            <input
              :key="panel.year"
              type="number"
              inputmode="numeric"
              :aria-label="`${labels.year}${months.length > 1 ? ` ${panel.monthIndex + 1}` : ''}`"
              :value="panel.year"
              :min="minYear"
              :max="maxYear"
              :disabled="disabled"
              @keydown.enter.prevent="
                ($event.currentTarget as HTMLInputElement).blur()
              "
              @blur="changeYear($event, panel.current, panel.monthIndex)"
            />
          </template>
          <strong v-else>{{ panel.title }}</strong>
        </div>
        <div
          role="grid"
          :aria-label="label"
          :aria-describedby="panel.headingId"
          :aria-multiselectable="mode === 'range' || undefined"
        >
          <div
            role="row"
            class="cr-calendar-week"
            :data-week-numbers="showWeekNumbers || undefined"
          >
            <span
              v-if="showWeekNumbers"
              role="columnheader"
              :aria-label="labels.week"
              >#</span
            >
            <span
              v-for="(day, index) in weekdays"
              :key="index"
              role="columnheader"
              :aria-label="day.label"
              >{{ day.text }}</span
            >
          </div>
          <div
            v-for="(week, index) in panel.weeks"
            :key="index"
            role="row"
            class="cr-calendar-week"
            :data-week-numbers="showWeekNumbers || undefined"
          >
            <span
              v-if="showWeekNumbers"
              role="rowheader"
              class="cr-calendar-week-number"
              >{{ week.number }}</span
            >
            <template v-for="(day, dayIndex) in week.days" :key="dayIndex">
              <span v-if="!day" role="gridcell" />
              <div
                v-else
                role="gridcell"
                :aria-selected="day.selected"
                :aria-disabled="day.blocked || undefined"
                :data-in-range="day.inRange || undefined"
                :data-range-start="
                  day.iso === displayedRange?.start || undefined
                "
                :data-range-end="day.iso === displayedRange?.end || undefined"
              >
                <button
                  type="button"
                  :data-date="day.iso"
                  :data-outside="day.outside || undefined"
                  :data-selected="
                    day.endpoint || selected === day.iso || undefined
                  "
                  :data-preview="(!!anchor && day.inRange) || undefined"
                  :aria-label="day.label"
                  :aria-current="day.iso === today ? 'date' : undefined"
                  :aria-disabled="day.blocked || undefined"
                  :disabled="day.blocked"
                  :tabindex="!day.blocked && day.iso === tabDate ? 0 : -1"
                  @focus="focusDay(day.iso)"
                  @mouseenter="anchor && (hovered = day.iso)"
                  @keydown="keyboard($event, day.iso)"
                  @click="choose(day.iso)"
                >
                  <slot
                    name="day"
                    :date="day.iso"
                    :day="day.day"
                    :selected="day.selected"
                    :disabled="day.blocked"
                    ><component
                      :is="() => renderDay!(day.iso)"
                      v-if="renderDay"
                    /><template v-else>{{ day.day }}</template></slot
                  >
                </button>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>
    <div
      :class="status ? 'cr-calendar-status' : 'cr-sr-only'"
      role="status"
      aria-live="polite"
    >
      {{ status }}
    </div>
  </div>
</template>
