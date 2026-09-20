<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { SwitchRoot, SwitchThumb } from "reka-ui";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label?: string;
    className?: string;
    checked?: boolean;
    defaultChecked?: boolean;
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
const model = defineModel<boolean | undefined>({ default: undefined });
const emit = defineEmits<{
  "checked-change": [checked: boolean];
  "update:checked": [checked: boolean];
}>();
const { field, fieldAttrs } = useFieldControl(() => props.id);
const generatedId = useId();
const inputId = computed(() => props.id ?? fieldAttrs.value.id ?? generatedId);
const disabled = computed(() => props.disabled || field?.disabled.value);
const root = ref<HTMLLabelElement>();
const checked = useControllable(
  model,
  () => props.checked,
  () => props.defaultChecked ?? false,
  (value) => {
    emit("checked-change", value);
    emit("update:checked", value);
  },
);
function update(value: boolean) {
  if (!props.readOnly) {
    checked.value = value;
    field?.notifyChange();
  }
}
useFormReset(
  root,
  () => {
    checked.value = props.defaultChecked ?? false;
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
    ><SwitchRoot
      v-bind="{ ...fieldAttrs, ...$attrs, name: undefined }"
      :id="inputId"
      :model-value="checked"
      :disabled="disabled"
      :required="required"
      :aria-readonly="readOnly || undefined"
      :class="cx('cr-switch', className)"
      :data-checked="checked ? '' : undefined"
      @update:model-value="update"
      ><SwitchThumb class="cr-switch-thumb" /></SwitchRoot
    ><input
      class="cr-sr-only"
      aria-hidden="true"
      tabindex="-1"
      type="checkbox"
      :name="name ?? fieldAttrs.name"
      :form="form"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      :required="required"
      @change="update(($event.target as HTMLInputElement).checked)"
    /><span
      ><slot>{{ label }}</slot></span
    ></label
  >
</template>
