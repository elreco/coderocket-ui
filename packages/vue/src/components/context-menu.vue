<script setup lang="ts">
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
} from "reka-ui";
import ContextMenuState from "./context-menu-state.vue";
import { usePortalContainer } from "./utils";
import { RenderContent } from "./display-utils";
import type { DisplayContent, MenuAction } from "./display-types";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    items: MenuAction[];
    emptyMessage?: DisplayContent;
    disabled?: boolean;
    modal?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    emptyMessage: "No actions available.",
    modal: true,
  },
);
const emit = defineEmits<{
  "update:open": [value: boolean];
  "open-change": [value: boolean];
  select: [item: MenuAction];
}>();
const container = usePortalContainer();
function select(item: MenuAction) {
  if (item.disabled) return;
  item.onSelect?.();
  emit("select", item);
}
function keyboard(event: KeyboardEvent) {
  if (
    props.disabled ||
    !(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))
  )
    return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  target.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    }),
  );
}
function update(open: boolean) {
  emit("update:open", open);
  emit("open-change", open);
}
</script>
<template>
  <ContextMenuRoot :modal="modal"
    ><ContextMenuState :open="open" :default-open="defaultOpen" @change="update"
      ><ContextMenuTrigger
        :disabled="disabled"
        :as-child="!!$slots.trigger"
        class="cr-context-trigger"
        tabindex="0"
        @keydown="keyboard"
        ><slot name="trigger"><slot /></slot></ContextMenuTrigger
      ><ContextMenuPortal :to="container"
        ><ContextMenuContent v-bind="$attrs" class="cr-popup"
          ><p v-if="!items.length" class="cr-description">
            <slot name="empty"><RenderContent :content="emptyMessage" /></slot>
          </p>
          <ContextMenuItem
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
            }}</slot></ContextMenuItem
          ></ContextMenuContent
        ></ContextMenuPortal
      ></ContextMenuState
    ></ContextMenuRoot
  >
</template>
