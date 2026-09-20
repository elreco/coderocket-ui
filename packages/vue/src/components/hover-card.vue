<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
} from "reka-ui";
import { useDisplayModel } from "./display-utils";
import { usePortalContainer } from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label: string;
    href: string;
    open?: boolean;
    defaultOpen?: boolean;
    openDelay?: number;
    closeDelay?: number;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  }>(),
  { open: undefined, defaultOpen: false, side: "bottom", align: "start" },
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
  <HoverCardRoot
    v-model:open="expanded"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    ><HoverCardTrigger :as-child="!!$slots.trigger" :href="href" class="cr-link"
      ><slot name="trigger">{{ label }}</slot></HoverCardTrigger
    ><HoverCardPortal :to="container"
      ><HoverCardContent
        v-bind="$attrs"
        :side="side"
        :align="align"
        :side-offset="8"
        class="cr-popup cr-hover-card"
        ><slot /></HoverCardContent></HoverCardPortal
  ></HoverCardRoot>
</template>
