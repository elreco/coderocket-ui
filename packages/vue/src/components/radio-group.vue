<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from "reka-ui";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  label: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  form?: string;
  id?: string;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  loop?: boolean;
  className?: string;
}>();
const model = defineModel<string>();
const emit = defineEmits<{ "value-change": [value: string] }>();
const { field, fieldAttrs } = useFieldControl(() => props.id);
const disabled = computed(() => props.disabled || field?.disabled.value);
const root = ref<HTMLDivElement>();
const id = useId();
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? "",
  (value) => emit("value-change", value),
);
function update(next: unknown) {
  if (props.readOnly || disabled.value) return;
  value.value = String(next);
  field?.notifyChange();
}
useFormReset(
  root,
  () => {
    value.value = props.defaultValue ?? "";
  },
  () => props.form,
);
</script>
<template>
  <RadioGroupRoot
    as-child
    v-bind="{ ...fieldAttrs, ...$attrs, name: undefined }"
    :model-value="value"
    :disabled="disabled"
    :required="required"
    :aria-label="label"
    :aria-readonly="readOnly || undefined"
    :orientation="orientation"
    :dir="dir"
    :loop="loop"
    @update:model-value="update"
    ><div ref="root" :class="cx('cr-radio-group', className)">
      <label
        v-for="(option, index) in options"
        :key="option.value"
        :for="`${id}-${index}`"
        class="cr-check-label"
        :data-disabled="disabled || option.disabled ? '' : undefined"
        ><RadioGroupItem
          :id="`${id}-${index}`"
          :value="option.value"
          :disabled="disabled || option.disabled"
          class="cr-radio"
          :data-checked="value === option.value ? '' : undefined"
          ><RadioGroupIndicator class="cr-radio-indicator" /></RadioGroupItem
        ><input
          class="cr-sr-only"
          aria-hidden="true"
          tabindex="-1"
          type="radio"
          :name="name ?? fieldAttrs.name"
          :form="form"
          :value="option.value"
          :checked="value === option.value"
          :disabled="disabled || option.disabled"
          :required="required"
          @change="update(option.value)"
        />{{ option.label }}</label
      >
    </div></RadioGroupRoot
  >
</template>
