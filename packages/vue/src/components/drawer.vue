<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "reka-ui";
import { useId } from "vue";
import { usePortalContainer } from "./utils";
import { RenderContent, focusTarget, useDisplayModel } from "./display-utils";
import type { OverlayProps } from "./display-types";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<
    OverlayProps & { swipeDirection?: "up" | "down" | "left" | "right" }
  >(),
  {
    open: undefined,
    trigger: undefined,
    footer: undefined,
    initialFocus: undefined,
    finalFocus: undefined,
    defaultOpen: false,
    modal: true,
    closeLabel: "Close",
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
const descriptionId = useId();

let gesture: { x: number; y: number; id: number } | undefined;
function startSwipe(event: PointerEvent) {
  if (event.button !== 0) return;
  gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}
function endSwipe(event: PointerEvent) {
  if (!gesture || gesture.id !== event.pointerId) return;
  const x = event.clientX - gesture.x,
    y = event.clientY - gesture.y;
  const direction = props.swipeDirection ?? "down";
  const distance =
    direction === "down"
      ? y
      : direction === "up"
        ? -y
        : direction === "left"
          ? -x
          : x;
  if (distance > 70) expanded.value = false;
  gesture = undefined;
}
</script>
<template>
  <DialogRoot v-model:open="expanded" :modal="modal"
    ><DialogTrigger
      v-if="trigger != null || triggerRender || $slots.trigger"
      :as-child="!!($slots.trigger || triggerRender)"
      :disabled="disabled"
      class="cr-button"
      data-variant="outline"
      ><slot name="trigger"
        ><component :is="triggerRender" v-if="triggerRender"
          ><RenderContent :content="trigger" /></component
        ><RenderContent v-else :content="trigger" /></slot></DialogTrigger
    ><DialogPortal :to="container"
      ><DialogOverlay class="cr-backdrop" />
      <div v-if="expanded" class="cr-modal-viewport" data-kind="drawer">
        <DialogContent
          v-bind="$attrs"
          :class="['cr-modal cr-drawer', className]"
          :aria-describedby="
            description || $slots.description ? descriptionId : undefined
          "
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
          ><div
            class="cr-drawer-handle"
            aria-hidden="true"
            @pointerdown="startSwipe"
            @pointerup="endSwipe"
            @pointercancel="gesture = undefined"
          >
            <span />
          </div>
          <header class="cr-modal-header">
            <DialogTitle class="cr-modal-title"
              ><slot name="title">{{ title }}</slot></DialogTitle
            ><DialogDescription
              :id="descriptionId"
              v-if="description || $slots.description"
              class="cr-description"
              ><slot name="description">{{
                description
              }}</slot></DialogDescription
            ><DialogClose
              class="cr-modal-close"
              :aria-label="closeLabel === 'Close' ? 'Close drawer' : closeLabel"
              ><svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" /></svg
            ></DialogClose>
          </header>
          <div class="cr-modal-content">
            <slot :close="() => (expanded = false)" />
          </div>
          <footer v-if="footer !== null" class="cr-modal-footer">
            <slot name="footer" :close="() => (expanded = false)"
              ><RenderContent
                v-if="footer !== undefined"
                :content="footer"
              /><DialogClose
                v-else
                class="cr-button"
                data-variant="secondary"
                >{{ closeLabel }}</DialogClose
              ></slot
            >
          </footer></DialogContent
        >
      </div></DialogPortal
    ></DialogRoot
  >
</template>
