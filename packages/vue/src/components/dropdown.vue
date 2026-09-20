<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from "reka-ui";
import type { Component } from "vue";
import { usePortalContainer } from "./utils";
import { RenderContent, useDisplayModel } from "./display-utils";
import type { DisplayContent, MenuAction } from "./display-types";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    trigger?: DisplayContent;
    triggerRender?: Component;
    items: MenuAction[];
    disabled?: boolean;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    emptyMessage?: DisplayContent;
    open?: boolean;
    defaultOpen?: boolean;
    modal?: boolean;
  }>(),
  {
    disabled: false,
    side: "bottom",
    align: "start",
    emptyMessage: "No actions available.",
    open: undefined,
    defaultOpen: false,
    modal: true,
  },
);
const emit = defineEmits<{
  "update:open": [value: boolean];
  "open-change": [value: boolean];
  select: [item: MenuAction];
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
function select(item: MenuAction) {
  if (item.disabled) return;
  item.onSelect?.();
  emit("select", item);
}
</script>
<template>
  <DropdownMenuRoot v-model:open="expanded" :modal="modal"
    ><DropdownMenuTrigger
      :as-child="!!($slots.trigger || triggerRender)"
      :disabled="disabled"
      class="cr-button"
      data-variant="outline"
      ><slot name="trigger"
        ><component :is="triggerRender" v-if="triggerRender"
          ><RenderContent :content="trigger" /></component
        ><template v-else
          ><RenderContent :content="trigger" /><svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path
              d="m6 9 6 6 6-6"
            /></svg></template></slot></DropdownMenuTrigger
    ><DropdownMenuPortal :to="container"
      ><DropdownMenuContent
        v-bind="$attrs"
        :side="side"
        :align="align"
        :side-offset="6"
        class="cr-popup"
        ><p v-if="!items.length" class="cr-description">
          <slot name="empty"><RenderContent :content="emptyMessage" /></slot>
        </p>
        <DropdownMenuItem
          v-for="(item, index) in items"
          :key="item.id ?? index"
          :as="item.href && !item.disabled ? 'a' : 'div'"
          :href="item.disabled ? undefined : item.href"
          :disabled="item.disabled"
          :data-destructive="item.destructive || undefined"
          class="cr-menu-item"
          @select="select(item)"
          ><slot name="item" :item="item">{{
            item.label
          }}</slot></DropdownMenuItem
        ></DropdownMenuContent
      ></DropdownMenuPortal
    ></DropdownMenuRoot
  >
</template>
