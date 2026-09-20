<script setup lang="ts">
import { watch } from "vue";
import { injectContextMenuRootContext } from "reka-ui";
const props = withDefaults(
  defineProps<{ open?: boolean; defaultOpen?: boolean }>(),
  { open: undefined, defaultOpen: false },
);
const emit = defineEmits<{ change: [value: boolean] }>();
const context = injectContextMenuRootContext();
let syncing = false;
function sync(value: boolean) {
  syncing = true;
  context.open.value = value;
  syncing = false;
}
sync(props.open ?? props.defaultOpen);
watch(
  () => props.open,
  (value) => {
    if (value !== undefined) sync(value);
  },
  { flush: "sync" },
);
watch(
  context.open,
  (value) => {
    if (syncing) return;
    emit("change", value);
    if (props.open !== undefined) sync(props.open);
  },
  { flush: "sync" },
);
</script>
<template><slot /></template>
