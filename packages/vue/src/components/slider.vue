<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from "reka-ui";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label: string;
    value?: number | readonly number[];
    defaultValue?: number | readonly number[];
    thumbLabels?: readonly string[];
    locale?: string;
    format?: Intl.NumberFormatOptions;
    disabled?: boolean;
    name?: string;
    form?: string;
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    inverted?: boolean;
    className?: string;
  }>(),
  { locale: "en-US", min: 0, max: 100, step: 1, orientation: "horizontal" },
);
const model = defineModel<number | readonly number[]>();
const emit = defineEmits<{
  "value-change": [value: number | readonly number[]];
  "value-committed": [value: number | readonly number[]];
}>();
const { field, fieldAttrs } = useFieldControl();
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? props.min,
  (next) => emit("value-change", next),
);
const values = computed(() =>
  Array.isArray(value.value) ? [...value.value] : [value.value as number],
);
const disabled = computed(() => props.disabled || field?.disabled.value);
const formatted = computed(() =>
  values.value
    .map((value) =>
      new Intl.NumberFormat(props.locale, props.format).format(value),
    )
    .join(" – "),
);
const root = ref<HTMLDivElement>();
const labelId = useId();
function convert(next: number[]) {
  return Array.isArray(value.value) ? next : (next[0] ?? props.min);
}
function update(next: number[] | undefined) {
  value.value = convert(next ?? []);
  field?.notifyChange();
}
useFormReset(
  root,
  () => {
    value.value = props.defaultValue ?? props.min;
  },
  () => props.form,
);
</script>
<template>
  <div
    ref="root"
    :class="cx('cr-slider', className)"
    :data-orientation="orientation"
    :data-disabled="disabled ? '' : undefined"
  >
    <div class="cr-row">
      <span :id="labelId" class="cr-label">{{ label }}</span
      ><output class="cr-description">{{ formatted }}</output>
    </div>
    <SliderRoot
      v-bind="{ ...fieldAttrs, ...$attrs, name: undefined }"
      class="cr-slider-control"
      :aria-labelledby="labelId"
      :model-value="values"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :min-steps-between-thumbs="minStepsBetweenThumbs"
      :orientation="orientation"
      :dir="dir"
      :inverted="inverted"
      @update:model-value="update"
      @value-commit="emit('value-committed', convert($event))"
      ><SliderTrack class="cr-slider-track"
        ><SliderRange
          class="cr-slider-indicator"
          :style="{
            position: 'absolute',
            height: orientation === 'horizontal' ? '100%' : undefined,
            width: orientation === 'vertical' ? '100%' : undefined,
          }" /><SliderThumb
          v-for="(_, index) in values"
          :key="index"
          class="cr-slider-thumb"
          :aria-label="
            thumbLabels?.[index] ??
            (values.length === 1
              ? label
              : `${label}, ${index + 1} of ${values.length}`)
          " /></SliderTrack></SliderRoot
    ><input
      v-for="(entry, index) in values"
      :key="index"
      type="hidden"
      :name="name ?? fieldAttrs.name"
      :form="form"
      :disabled="disabled"
      :value="entry"
    />
  </div>
</template>
