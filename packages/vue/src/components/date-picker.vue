<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import {
  FocusScope,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";
import { CalendarDays, X } from "@lucide/vue";
import Calendar from "./calendar.vue";
import {
  addCalendarDays,
  addCalendarMonths,
  calendarLabels,
  endOfCalendarMonth,
  isCalendarDateDisabled,
  isCalendarRangeAvailable,
  parseCalendarDate,
  startOfCalendarMonth,
  useCalendarToday,
  type CalendarValue,
  type DatePickerProps,
  type DatePickerShortcut,
} from "./calendar-utils";
import { cx, usePortalContainer } from "./utils";

const props = withDefaults(defineProps<DatePickerProps>(), {
  mode: "single",
  locale: "en",
  disabled: false,
  autoApply: true,
  inline: false,
  overlay: false,
  collisionPadding: 16,
  clearable: true,
  showInputs: true,
  shortcuts: true,
  separator: " – ",
  open: undefined,
  // Preserve the calendar defaults when forwarding optional Boolean props.
  excludeDisabled: true,
  monthSelection: true,
});
const emit = defineEmits<{
  "update:modelValue": [value: CalendarValue];
  valueChange: [value: CalendarValue];
  "update:open": [open: boolean];
  openChange: [open: boolean];
  monthChange: [month: string];
  selectionPendingChange: [pending: boolean];
}>();
const root = ref<HTMLDivElement>();
const calendar = ref<InstanceType<typeof Calendar>>();
const portalContainer = usePortalContainer();
const headingId = useId();
const errorId = useId();
const labels = computed(() => calendarLabels(props.locale, props.labels));
const label = computed(
  () =>
    props.label ??
    (props.mode === "range"
      ? labels.value.chooseRange
      : labels.value.chooseDate),
);
const placeholder = computed(() => props.placeholder ?? label.value);
const internal = ref<CalendarValue>(props.defaultValue ?? null);
const internalOpen = ref(false);
const chosen = computed(() =>
  props.modelValue !== undefined ? props.modelValue : internal.value,
);
const open = computed(
  () => (props.open ?? internalOpen.value) && !props.disabled,
);
const draft = ref<CalendarValue>(chosen.value);
const selectionPending = ref(false);
const calendarKey = ref(0);
const error = ref("");
const getStart = (value: CalendarValue) =>
  typeof value === "string" ? value : (value?.start ?? "");
const getEnd = (value: CalendarValue) =>
  value && typeof value === "object" ? value.end : "";
const startInput = ref(getStart(chosen.value));
const endInput = ref(getEnd(chosen.value));
function pendingChange(pending: boolean) {
  selectionPending.value = pending;
  emit("selectionPendingChange", pending);
}
function synchronize(value = chosen.value, resetCalendar = true) {
  draft.value = value;
  startInput.value = getStart(value);
  endInput.value = getEnd(value);
  error.value = "";
  pendingChange(false);
  if (resetCalendar) calendarKey.value++;
}
watch(
  [() => getStart(chosen.value), () => getEnd(chosen.value), () => props.mode],
  () => synchronize(chosen.value, false),
);
function setOpen(next: boolean) {
  if (next && props.disabled) return;
  if (next) synchronize();
  else {
    calendar.value?.cancelPendingSelection();
    pendingChange(false);
  }
  if (props.open === undefined) internalOpen.value = next;
  emit("update:open", next);
  emit("openChange", next);
}
// A parent may open the picker directly through v-model:open.
watch(open, (next, previous) => {
  if (next && !previous) synchronize();
  if (!next && previous) {
    calendar.value?.cancelPendingSelection();
    pendingChange(false);
  }
});
function resetForm() {
  const next =
    props.modelValue === undefined
      ? (props.defaultValue ?? null)
      : props.modelValue;
  if (props.modelValue === undefined) internal.value = next;
  synchronize(next);
  setOpen(false);
}
let removeReset: (() => void) | undefined;
function bindForm() {
  removeReset?.();
  const form = props.form
    ? document.getElementById(props.form)
    : root.value?.closest("form");
  if (!(form instanceof HTMLFormElement)) return;
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!event.defaultPrevented) resetForm();
    });
  form.addEventListener("reset", reset);
  removeReset = () => form.removeEventListener("reset", reset);
}
onMounted(bindForm);
watch(() => props.form, bindForm, { flush: "post" });
onBeforeUnmount(() => removeReset?.());
function valid(value: CalendarValue) {
  if (!value) return true;
  if (typeof value === "object")
    return props.mode === "range" && isCalendarRangeAvailable(value, props);
  try {
    parseCalendarDate(value);
  } catch {
    return false;
  }
  return props.mode !== "range" && !isCalendarDateDisabled(value, props);
}
function commit(value: CalendarValue) {
  if (props.disabled || !valid(value)) return;
  const next =
    props.mode === "range"
      ? value && typeof value === "object"
        ? value
        : null
      : typeof value === "string"
        ? value
        : "";
  if (props.modelValue === undefined) internal.value = next;
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function select(value: CalendarValue, close = true, resetCalendar = false) {
  if (props.disabled) return;
  if (!valid(value)) {
    error.value = labels.value.invalidDate;
    return;
  }
  const visible =
    props.autoApply && props.modelValue !== undefined ? chosen.value : value;
  synchronize(visible, resetCalendar);
  if (props.autoApply) {
    commit(value);
    if (!props.inline && close) setOpen(false);
  }
}
function edit(start: string, end: string) {
  if (props.disabled) return;
  startInput.value = start;
  endInput.value = end;
  const next =
    props.mode === "range" ? (start && end ? { start, end } : null) : start;
  if ((props.mode === "range" && !!start !== !!end) || !valid(next)) {
    error.value = labels.value.invalidDate;
    return;
  }
  error.value = "";
  draft.value = next;
  pendingChange(false);
  calendarKey.value++;
  if (props.autoApply) commit(next);
}
function finishInput() {
  if (props.autoApply && props.modelValue !== undefined && !error.value) {
    startInput.value = getStart(chosen.value);
    endInput.value = getEnd(chosen.value);
  }
}
function cancel() {
  synchronize();
  if (!props.inline) setOpen(false);
}
function apply() {
  if (selectionPending.value || error.value) return;
  commit(draft.value);
  if (!props.inline) setOpen(false);
}
function escape(event: KeyboardEvent) {
  if (selectionPending.value) {
    event.preventDefault();
    calendar.value?.cancelPendingSelection();
  }
}
const format = (date: string) =>
  props.formatDate?.(date, props.locale) ??
  new Intl.DateTimeFormat(
    props.locale,
    props.dateFormat
      ? { ...props.dateFormat, timeZone: "UTC", calendar: "gregory" }
      : { dateStyle: "medium", timeZone: "UTC", calendar: "gregory" },
  ).format(parseCalendarDate(date));
const display = computed(() =>
  !chosen.value
    ? ""
    : typeof chosen.value === "string"
      ? format(chosen.value)
      : `${format(chosen.value.start)}${props.separator}${format(chosen.value.end)}`,
);
const localToday = useCalendarToday();
const items = computed(() => {
  const today = localToday.value || "1970-01-01",
    yesterday = addCalendarDays(today, -1);
  const lastMonth = startOfCalendarMonth(addCalendarMonths(today, -1));
  const defaults: DatePickerShortcut[] =
    props.mode === "range"
      ? [
          { label: labels.value.today, value: { start: today, end: today } },
          {
            label: labels.value.yesterday,
            value: { start: yesterday, end: yesterday },
          },
          {
            label: labels.value.last7Days,
            value: { start: addCalendarDays(today, -6), end: today },
          },
          {
            label: labels.value.last30Days,
            value: { start: addCalendarDays(today, -29), end: today },
          },
          {
            label: labels.value.thisMonth,
            value: {
              start: startOfCalendarMonth(today),
              end: endOfCalendarMonth(today),
            },
          },
          {
            label: labels.value.lastMonth,
            value: { start: lastMonth, end: endOfCalendarMonth(lastMonth) },
          },
        ]
      : [
          { label: labels.value.today, value: today },
          { label: labels.value.yesterday, value: yesterday },
        ];
  const shortcuts = Array.isArray(props.shortcuts)
    ? props.shortcuts
    : props.shortcuts
      ? defaults
      : [];
  return shortcuts.map((item: DatePickerShortcut) => {
    const value = typeof item.value === "function" ? item.value() : item.value;
    return {
      label: item.label,
      value,
      disabled:
        props.disabled ||
        (!localToday.value && !Array.isArray(props.shortcuts)) ||
        !valid(value),
    };
  });
});
const calendarValue = computed(() =>
  props.autoApply ? chosen.value : draft.value,
);
const common = computed(() => ({
  label: label.value,
  min: props.min,
  max: props.max,
  locale: props.locale,
  weekStartsOn: props.weekStartsOn,
  disabled: props.disabled,
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
}));
const contentAttributes = computed(() =>
  props.inline
    ? { role: "group", "aria-label": label.value }
    : {
        class: "cr-positioner cr-date-picker-positioner",
        align: "start" as const,
        sideOffset: 8,
        collisionPadding: props.collisionPadding,
        prioritizePosition: true,
        sticky: "always" as const,
        "aria-labelledby": headingId,
      },
);
const scopeAttributes = computed(() =>
  props.inline || props.overlay ? {} : { trapped: open.value, loop: true },
);
</script>

<template>
  <div ref="root" :class="cx('cr-date-picker', className)">
    <template v-if="name">
      <input
        type="hidden"
        :form="form"
        :name="mode === 'range' ? `${name}[start]` : name"
        :value="getStart(chosen)"
        :disabled="disabled"
      />
      <input
        v-if="mode === 'range'"
        type="hidden"
        :form="form"
        :name="`${name}[end]`"
        :value="getEnd(chosen)"
        :disabled="disabled"
      />
    </template>
    <PopoverRoot
      :open="open && !inline"
      :modal="overlay"
      @update:open="setOpen"
    >
      <PopoverTrigger
        v-if="!inline"
        :class="cx('cr-button cr-date-picker-trigger', triggerClassName)"
        data-variant="outline"
        data-size="md"
        :disabled="disabled"
        :aria-label="`${label}${display ? `: ${display}` : ''}`"
      >
        <slot
          name="trigger"
          :value="display"
          :placeholder="placeholder"
          :open="open"
        >
          <component
            :is="() => renderTrigger!(display, placeholder)"
            v-if="renderTrigger"
          />
          <template v-else>
            <span :data-placeholder="!display || undefined">{{
              display || placeholder
            }}</span>
            <slot name="icon"
              ><component :is="() => icon" v-if="icon" /><CalendarDays
                v-else
                :size="16"
                aria-hidden="true"
            /></slot>
          </template>
        </slot>
      </PopoverTrigger>
      <component
        :is="inline ? 'div' : PopoverPortal"
        v-bind="inline ? {} : { to: portalContainer }"
      >
        <div
          v-if="!inline && overlay && open"
          class="cr-date-picker-backdrop"
          aria-hidden="true"
        />
        <component
          :is="inline ? 'div' : PopoverContent"
          v-bind="contentAttributes"
          @escape-key-down="escape"
        >
          <component
            :is="inline || overlay ? 'div' : FocusScope"
            v-bind="scopeAttributes"
            :class="
              inline ? 'cr-date-picker-inline' : 'cr-popup cr-date-picker-popup'
            "
            @mount-auto-focus.prevent
            @unmount-auto-focus.prevent
          >
            <div v-if="!inline" class="cr-date-picker-heading">
              <h2 :id="headingId">{{ label }}</h2>
              <PopoverClose
                class="cr-date-picker-close"
                :aria-label="labels.close"
                ><X :size="16" aria-hidden="true"
              /></PopoverClose>
            </div>
            <div class="cr-date-picker-body">
              <div
                v-if="items.length"
                class="cr-date-picker-shortcuts"
                :aria-label="label"
              >
                <button
                  v-for="(item, index) in items"
                  :key="index"
                  type="button"
                  class="cr-button"
                  data-variant="ghost"
                  data-size="sm"
                  :disabled="item.disabled"
                  @click="select(item.value, true, true)"
                >
                  {{ item.label }}
                </button>
              </div>
              <div v-if="showInputs" class="cr-date-picker-inputs">
                <label>
                  <span>{{ mode === "range" ? labels.startDate : label }}</span>
                  <input
                    type="date"
                    :value="startInput"
                    :min="min ?? '0001-01-01'"
                    :max="max ?? '9999-12-31'"
                    :disabled="disabled"
                    :aria-invalid="!!error || undefined"
                    :aria-describedby="error ? errorId : undefined"
                    @blur="finishInput"
                    @change="
                      edit(($event.target as HTMLInputElement).value, endInput)
                    "
                  />
                </label>
                <label v-if="mode === 'range'">
                  <span>{{ labels.endDate }}</span>
                  <input
                    type="date"
                    :value="endInput"
                    :min="startInput || min || '0001-01-01'"
                    :max="max ?? '9999-12-31'"
                    :disabled="disabled"
                    :aria-invalid="!!error || undefined"
                    :aria-describedby="error ? errorId : undefined"
                    @blur="finishInput"
                    @change="
                      edit(
                        startInput,
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                  />
                </label>
              </div>
              <Calendar
                ref="calendar"
                :key="calendarKey"
                v-bind="common"
                :mode="mode"
                :model-value="calendarValue"
                @update:model-value="select"
                @month-change="emit('monthChange', $event)"
                @selection-pending-change="pendingChange"
              >
                <template v-if="$slots.day" #day="slotProps"
                  ><slot name="day" v-bind="slotProps"
                /></template>
              </Calendar>
              <p
                v-if="error"
                :id="errorId"
                class="cr-date-picker-error"
                role="alert"
              >
                {{ error }}
              </p>
            </div>
            <div v-if="clearable || !autoApply" class="cr-date-picker-footer">
              <button
                v-if="clearable"
                type="button"
                class="cr-button"
                data-variant="ghost"
                data-size="sm"
                :disabled="disabled || (!startInput && !endInput)"
                @click="select(mode === 'range' ? null : '', false, true)"
              >
                {{ labels.clear }}
              </button>
              <div v-if="!autoApply" class="cr-date-picker-actions">
                <button
                  type="button"
                  class="cr-button"
                  data-variant="ghost"
                  data-size="sm"
                  :disabled="disabled"
                  @click="cancel"
                >
                  {{ labels.cancel }}
                </button>
                <button
                  type="button"
                  class="cr-button"
                  data-variant="primary"
                  data-size="sm"
                  :disabled="
                    disabled || selectionPending || !!error || !valid(draft)
                  "
                  @click="apply"
                >
                  {{ labels.apply }}
                </button>
              </div>
            </div>
          </component>
        </component>
      </component>
    </PopoverRoot>
  </div>
</template>

<style scoped>
/* Reka exposes the space beside the trigger on PopoverContent. The calendar
   body scrolls inside that space while the heading and actions stay visible. */
.cr-date-picker-popup.cr-popup {
  max-height: min(
    var(--reka-popover-content-available-height, 100dvh),
    calc(100dvh - 32px)
  );
  max-width: min(
    var(--reka-popover-content-available-width, 100vw),
    calc(100vw - 32px)
  );
}
</style>
