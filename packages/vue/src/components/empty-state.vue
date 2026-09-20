<script setup lang="ts">
import type { DisplayContent } from "./display-types";
import { RenderContent } from "./display-utils";
defineProps<{
  title: string;
  description?: string;
  icon?: DisplayContent;
  action?: DisplayContent;
}>();
</script>
<template>
  <section class="cr-empty-state">
    <div v-if="icon || $slots.icon" aria-hidden="true" class="cr-empty-icon">
      <slot name="icon"><RenderContent :content="icon" /></slot>
    </div>
    <h3>{{ title }}</h3>
    <p v-if="description" class="cr-description">{{ description }}</p>
    <slot name="action"><RenderContent :content="action" /></slot><slot />
  </section>
</template>
