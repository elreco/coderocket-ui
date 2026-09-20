<script setup lang="ts">
import type { DisplayContent } from "./display-types";
import { RenderContent } from "./display-utils";
withDefaults(
  defineProps<{
    title?: DisplayContent;
    variant?: "info" | "success" | "warning" | "destructive";
    announce?: boolean;
    role?: string;
    className?: string;
  }>(),
  { variant: "info", announce: false },
);
</script>
<template>
  <div
    :class="['cr-alert', className]"
    :data-variant="variant"
    :role="role ?? (announce ? 'alert' : undefined)"
  >
    <strong v-if="title || $slots.title"
      ><slot name="title"><RenderContent :content="title" /></slot
    ></strong>
    <div v-if="$slots.default"><slot /></div>
  </div>
</template>
