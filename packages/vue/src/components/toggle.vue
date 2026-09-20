<script setup lang="ts">
import { Toggle } from "reka-ui";
import { cx, useControllable } from "./utils";
const props = withDefaults(
  defineProps<{
    pressed?: boolean;
    defaultPressed?: boolean;
    disabled?: boolean;
    className?: string;
    asChild?: boolean;
  }>(),
  { pressed: undefined },
);
const model = defineModel<boolean | undefined>({ default: undefined });
const emit = defineEmits<{
  "pressed-change": [pressed: boolean];
  "update:pressed": [pressed: boolean];
}>();
const pressed = useControllable(
  model,
  () => props.pressed,
  () => props.defaultPressed ?? false,
  (value) => {
    emit("pressed-change", value);
    emit("update:pressed", value);
  },
);
</script>
<template>
  <Toggle
    v-model="pressed"
    :disabled="disabled"
    :as-child="asChild"
    :class="cx('cr-toggle', className)"
    :data-pressed="pressed ? '' : undefined"
    ><slot
  /></Toggle>
</template>
