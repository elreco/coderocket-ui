<script setup lang="ts">
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
} from "reka-ui";
import type { Component } from "vue";
import type { DisplayContent } from "./display-types";
import { RenderContent, useDisplayModel } from "./display-utils";
import { usePortalContainer } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    trigger?: DisplayContent;
    triggerRender?: Component;
    content?: DisplayContent;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    delay?: number;
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    disableHoverableContent?: boolean;
  }>(),
  { side: "top", align: "center", open: undefined, defaultOpen: false },
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
const container = usePortalContainer();
</script>
<template>
  <TooltipProvider
    :delay-duration="delay"
    :disable-hoverable-content="disableHoverableContent"
    ><TooltipRoot v-model:open="expanded" :disabled="disabled"
      ><TooltipTrigger
        :as-child="!!($slots.trigger || triggerRender)"
        class="cr-button"
        data-variant="outline"
        ><slot name="trigger"
          ><component :is="triggerRender" v-if="triggerRender"
            ><RenderContent :content="trigger" /></component
          ><RenderContent v-else :content="trigger" /></slot></TooltipTrigger
      ><TooltipPortal :to="container"
        ><TooltipContent
          v-bind="$attrs"
          :side="side"
          :align="align"
          :side-offset="6"
          class="cr-tooltip"
          ><slot><RenderContent :content="content" /></slot
          ><TooltipArrow /></TooltipContent></TooltipPortal></TooltipRoot
  ></TooltipProvider>
</template>
