<script setup lang="ts">
import { computed, provide } from "vue";
import {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "reka-ui";
import { RenderContent } from "./display-utils";
import { usePortalContainer } from "./utils";
import {
  createToastManager,
  toastManagerKey,
  type ToastManager,
} from "./toast-manager";
const props = withDefaults(
  defineProps<{
    toastManager?: ToastManager;
    limit?: number;
    timeout?: number;
    dismissLabel?: string;
    label?: string;
    swipeDirection?: "up" | "down" | "left" | "right";
  }>(),
  {
    limit: 3,
    timeout: 6000,
    dismissLabel: "Dismiss notification",
    label: "Notification",
    swipeDirection: "right",
  },
);
const manager = props.toastManager ?? createToastManager();
provide(toastManagerKey, manager);
const container = usePortalContainer();
const visible = computed(() =>
  manager.toasts.slice(
    -Math.max(1, Number.isFinite(props.limit) ? Math.floor(props.limit) : 3),
  ),
);
defineExpose({ manager });
</script>
<template>
  <ToastProvider
    :duration="timeout === 0 ? Infinity : timeout"
    :label="label"
    :swipe-direction="swipeDirection"
    ><slot :manager="manager" /><Teleport :to="container ?? 'body'"
      ><ToastViewport class="cr-toast-viewport" :label="label" /></Teleport
    ><ToastRoot
      v-for="toast in visible"
      :key="`${toast.id}-${toast.updateKey}`"
      :open="toast.open"
      :duration="toast.timeout === 0 ? Infinity : toast.timeout"
      :type="toast.priority === 'high' ? 'foreground' : 'background'"
      :data-type="toast.type"
      class="cr-toast"
      @update:open="
        (open) => {
          if (!open) manager.close(toast.id);
        }
      "
      ><div>
        <ToastTitle v-if="toast.title" class="cr-toast-title"
          ><RenderContent :content="toast.title" /></ToastTitle
        ><ToastDescription v-if="toast.description" class="cr-description"
          ><RenderContent :content="toast.description" /></ToastDescription
        ><ToastAction
          v-if="toast.actionProps"
          class="cr-button"
          data-variant="secondary"
          :alt-text="
            toast.actionProps.altText ??
            toast.actionProps.label ??
            (typeof toast.actionProps.children === 'string'
              ? toast.actionProps.children
              : 'Perform notification action')
          "
          :disabled="toast.actionProps.disabled"
          @click="toast.actionProps.onClick"
          ><RenderContent
            :content="toast.actionProps.children ?? toast.actionProps.label"
        /></ToastAction>
      </div>
      <ToastClose :aria-label="dismissLabel" class="cr-toast-close"
        ><svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M18 6 6 18" /></svg></ToastClose></ToastRoot
  ></ToastProvider>
</template>
