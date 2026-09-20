<script setup lang="ts">
import { ref } from "vue";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  id?: string;
  name?: string;
  form?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  className?: string;
}>();
const model = defineModel<string | number>();
const emit = defineEmits<{ "value-change": [value: string] }>();
const input = ref<HTMLInputElement>();
const { fieldAttrs, field } = useFieldControl(() => props.id);
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? "",
  (next) => emit("value-change", String(next)),
);
useFormReset(
  input,
  () => {
    value.value = props.defaultValue ?? "";
  },
  () => props.form,
);
defineExpose({
  input,
  focus: () => input.value?.focus(),
  select: () => input.value?.select(),
});
</script>
<template>
  <input
    ref="input"
    v-bind="{ ...fieldAttrs, ...$attrs }"
    :id="id ?? fieldAttrs.id"
    :name="name ?? fieldAttrs.name"
    :form="form"
    :required="required"
    :disabled="disabled || field?.disabled.value"
    :class="cx('cr-input', className)"
    :value="value"
    @input="value = ($event.target as HTMLInputElement).value"
  />
</template>
