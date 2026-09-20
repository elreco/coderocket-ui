<script setup lang="ts">
import { computed, ref } from "vue";
import { ToggleGroupRoot, ToggleGroupItem } from "reka-ui";
import { cx, useControllable, useFormReset } from "./utils";
const props = defineProps<{
  label: string;
  items: readonly { value: string; label: string; disabled?: boolean }[];
  value?: string[];
  defaultValue?: string[];
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  form?: string;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  loop?: boolean;
  rovingFocus?: boolean;
  className?: string;
}>();
const model = defineModel<string[]>();
const emit = defineEmits<{ "value-change": [value: string[]] }>();
const root = ref<HTMLDivElement>();
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? [],
  (value) => emit("value-change", value),
);
const selected = computed(() =>
  props.multiple ? value.value : (value.value[0] ?? ""),
);
function update(next: unknown) {
  value.value = Array.isArray(next)
    ? next.map(String)
    : next
      ? [String(next)]
      : [];
}
useFormReset(
  root,
  () => {
    value.value = props.defaultValue ?? [];
  },
  () => props.form,
);
</script>
<template>
  <ToggleGroupRoot
    as-child
    :model-value="selected"
    :type="multiple ? 'multiple' : 'single'"
    :disabled="disabled"
    :orientation="orientation"
    :dir="dir"
    :loop="loop"
    :roving-focus="rovingFocus"
    :aria-label="label"
    @update:model-value="update"
    ><div
      ref="root"
      :class="cx('cr-toggle-group', className)"
      :data-orientation="orientation"
    >
      <ToggleGroupItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="cr-toggle"
        :data-pressed="value.includes(item.value) ? '' : undefined"
        >{{ item.label }}</ToggleGroupItem
      ><input
        v-for="item in value"
        :key="item"
        type="hidden"
        :name="name"
        :form="form"
        :value="item"
        :disabled="disabled"
      /></div
  ></ToggleGroupRoot>
</template>
