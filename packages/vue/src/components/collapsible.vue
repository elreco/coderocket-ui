<script setup lang="ts">
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from "reka-ui";
import { useDisplayModel } from "./display-utils";
const props = withDefaults(
  defineProps<{
    title: string;
    defaultOpen?: boolean;
    open?: boolean;
    disabled?: boolean;
    keepMounted?: boolean;
  }>(),
  { defaultOpen: false, open: undefined, disabled: false, keepMounted: false },
);
const emit = defineEmits<{
  "update:open": [value: boolean];
  "open-change": [value: boolean];
}>();
const expanded = useDisplayModel(
  () => props.open,
  props.defaultOpen,
  (value) => {
    emit("update:open", value);
    emit("open-change", value);
  },
);
</script>
<template>
  <CollapsibleRoot
    v-model:open="expanded"
    :disabled="disabled"
    class="cr-collapsible"
    ><CollapsibleTrigger
      :as-child="!!$slots.trigger"
      class="cr-button cr-collapsible-trigger"
      data-variant="ghost"
      ><slot name="trigger"
        >{{ title
        }}<svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" /></svg></slot></CollapsibleTrigger
    ><CollapsibleContent
      :force-mount="keepMounted || undefined"
      v-show="!keepMounted || expanded"
      class="cr-collapsible-panel"
      ><slot /></CollapsibleContent
  ></CollapsibleRoot>
</template>
