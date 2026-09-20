<script setup lang="ts">
import { ref } from "vue";
import { cx, useControllable, useFieldControl, useFormReset } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    form?: string;
    disabled?: boolean;
    required?: boolean;
    value?: string;
    defaultValue?: string;
    rows?: number;
    className?: string;
  }>(),
  { rows: 4 },
);
const model = defineModel<string>();
const emit = defineEmits<{ "value-change": [value: string] }>();
const input = ref<HTMLTextAreaElement>();
const { fieldAttrs, field } = useFieldControl(() => props.id);
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? "",
  (next) => emit("value-change", next),
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
  <textarea
    ref="input"
    v-bind="{ ...fieldAttrs, ...$attrs }"
    :id="id ?? fieldAttrs.id"
    :name="name ?? fieldAttrs.name"
    :form="form"
    :required="required"
    :disabled="disabled || field?.disabled.value"
    :class="cx('cr-textarea', className)"
    :rows="rows"
    :value="value"
    @input="value = ($event.target as HTMLTextAreaElement).value"
  />
</template>
