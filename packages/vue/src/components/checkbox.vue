<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { CheckboxRoot, CheckboxIndicator } from "reka-ui";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label?: string;
    className?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    id?: string;
    name?: string;
    form?: string;
    value?: string;
  }>(),
  { checked: undefined, value: "on" },
);
const model = defineModel<boolean | "indeterminate" | undefined>({
  default: undefined,
});
const emit = defineEmits<{
  "checked-change": [checked: boolean];
  "update:checked": [checked: boolean];
}>();
const { field, fieldAttrs } = useFieldControl(() => props.id);
const generatedId = useId();
const inputId = computed(() => props.id ?? fieldAttrs.value.id ?? generatedId);
const disabled = computed(() => props.disabled || field?.disabled.value);
const root = ref<HTMLLabelElement>();
const state = useControllable<boolean | "indeterminate">(
  model,
  () => props.checked,
  () => props.defaultChecked ?? false,
  (value) => {
    emit("checked-change", value === true);
    emit("update:checked", value === true);
  },
);
const checked = computed(() =>
  props.indeterminate ? "indeterminate" : state.value,
);
function update(value: boolean | "indeterminate") {
  if (!props.readOnly) {
    state.value = value;
    field?.notifyChange();
  }
}
useFormReset(
  root,
  () => {
    state.value = props.defaultChecked ?? false;
  },
  () => props.form,
);
</script>
<template>
  <label
    ref="root"
    :for="inputId"
    class="cr-check-label"
    :data-disabled="disabled ? '' : undefined"
    ><CheckboxRoot
      v-bind="{ ...fieldAttrs, ...$attrs, name: undefined }"
      :id="inputId"
      :model-value="checked"
      :disabled="disabled"
      :required="required"
      :aria-readonly="readOnly || undefined"
      :class="cx('cr-checkbox', className)"
      :data-checked="checked === true ? '' : undefined"
      :data-indeterminate="checked === 'indeterminate' ? '' : undefined"
      @update:model-value="update"
      ><CheckboxIndicator class="cr-check-indicator"
        ><svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            :d="checked === 'indeterminate' ? 'M5 12h14' : 'm5 12 4 4L19 6'"
          /></svg></CheckboxIndicator></CheckboxRoot
    ><input
      class="cr-sr-only"
      aria-hidden="true"
      tabindex="-1"
      type="checkbox"
      :name="name ?? fieldAttrs.name"
      :form="form"
      :value="value"
      :checked="state === true"
      :indeterminate="checked === 'indeterminate'"
      :disabled="disabled"
      :required="required"
      @change="update(($event.target as HTMLInputElement).checked)"
    /><span
      ><slot>{{ label }}</slot></span
    ></label
  >
</template>
