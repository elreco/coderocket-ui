<script setup lang="ts">
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "reka-ui";
import { useId } from "vue";
import { usePortalContainer } from "./utils";
import { RenderContent, focusTarget, useDisplayModel } from "./display-utils";
import type { OverlayProps } from "./display-types";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<OverlayProps>(), {
  open: undefined,
  trigger: undefined,
  footer: undefined,
  initialFocus: undefined,
  finalFocus: undefined,
  defaultOpen: false,
  modal: true,
  closeLabel: "Close",
});
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
</script>
<template>
  <AlertDialogRoot v-model:open="expanded"
    ><AlertDialogTrigger
      v-if="trigger != null || triggerRender || $slots.trigger"
      :as-child="!!($slots.trigger || triggerRender)"
      :disabled="disabled"
      class="cr-button"
      data-variant="outline"
      ><slot name="trigger"
        ><component :is="triggerRender" v-if="triggerRender"
          ><RenderContent :content="trigger" /></component
        ><RenderContent v-else :content="trigger" /></slot></AlertDialogTrigger
    ><AlertDialogPortal :to="container"
      ><AlertDialogOverlay class="cr-backdrop" />
      <div v-if="expanded" class="cr-modal-viewport" data-kind="alert-dialog">
        <AlertDialogContent
          v-bind="$attrs"
          :class="['cr-modal cr-alert-dialog', className]"
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
          ><header class="cr-modal-header">
            <AlertDialogTitle class="cr-modal-title"
              ><slot name="title">{{ title }}</slot></AlertDialogTitle
            ><AlertDialogDescription
              :id="descriptionId"
              v-if="description || $slots.description"
              class="cr-description"
              ><slot name="description">{{
                description
              }}</slot></AlertDialogDescription
            ><AlertDialogCancel
              class="cr-modal-close"
              :aria-label="closeLabel === 'Close' ? 'Close alert' : closeLabel"
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
            ></AlertDialogCancel>
          </header>
          <div class="cr-modal-content">
            <slot :close="() => (expanded = false)" />
          </div>
          <footer v-if="footer !== null" class="cr-modal-footer">
            <slot name="footer" :close="() => (expanded = false)"
              ><RenderContent
                v-if="footer !== undefined"
                :content="footer"
              /><AlertDialogCancel
                v-else
                class="cr-button"
                data-variant="secondary"
                >{{ closeLabel }}</AlertDialogCancel
              ></slot
            >
          </footer></AlertDialogContent
        >
      </div></AlertDialogPortal
    ></AlertDialogRoot
  >
</template>
