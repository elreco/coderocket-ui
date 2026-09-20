<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
} from "reka-ui";
import { useId } from "vue";
import { usePortalContainer } from "./utils";
import { RenderContent, focusTarget, useDisplayModel } from "./display-utils";
import type { OverlayProps } from "./display-types";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<
    OverlayProps & {
      side?: "top" | "bottom" | "left" | "right";
      align?: "start" | "center" | "end";
      triggerLabel?: string;
    }
  >(),
  {
    open: undefined,
    defaultOpen: false,
    modal: false,
    side: "bottom",
    align: "center",
    closeLabel: "Close popover",
  },
);
const emit = defineEmits<{
  "update:open": [value: boolean];
  "open-change": [value: boolean];
  "open-auto-focus": [event: Event];
  "close-auto-focus": [event: Event];
  "escape-key-down": [event: KeyboardEvent];
  "interact-outside": [event: Event];
}>();
const expanded = useDisplayModel(
  () => props.open,
  props.defaultOpen,
  (value) => {
    emit("update:open", value);
    emit("open-change", value);
  },
);
const container = usePortalContainer();
const titleId = useId();
</script>
<template>
  <PopoverRoot v-model:open="expanded" :modal="modal"
    ><PopoverTrigger
      v-if="trigger != null || triggerRender || $slots.trigger"
      :as-child="!!($slots.trigger || triggerRender)"
      :disabled="disabled"
      :aria-label="triggerLabel"
      class="cr-button"
      data-variant="outline"
      ><slot name="trigger"
        ><component :is="triggerRender" v-if="triggerRender"
          ><RenderContent :content="trigger" /></component
        ><RenderContent v-else :content="trigger" /></slot></PopoverTrigger
    ><PopoverPortal :to="container"
      ><PopoverContent
        v-bind="$attrs"
        :side="side"
        :align="align"
        :side-offset="8"
        :aria-labelledby="titleId"
        :class="['cr-popup cr-popover', className]"
        @open-auto-focus="
          (event) => {
            focusTarget(event, initialFocus);
            emit('open-auto-focus', event);
          }
        "
        @close-auto-focus="
          (event) => {
            focusTarget(event, finalFocus);
            emit('close-auto-focus', event);
          }
        "
        @escape-key-down="emit('escape-key-down', $event)"
        @interact-outside="emit('interact-outside', $event)"
        ><h2 :id="titleId" class="cr-popover-title">
          <slot name="title">{{ title }}</slot>
        </h2>
        <slot :close="() => (expanded = false)" /><PopoverClose
          :aria-label="closeLabel"
          class="cr-popover-close"
          ><svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path
              d="m6 6 12 12M18 6 6 18"
            /></svg></PopoverClose></PopoverContent></PopoverPortal
  ></PopoverRoot>
</template>
