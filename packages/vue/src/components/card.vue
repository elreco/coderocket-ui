<script setup lang="ts">
import type { DisplayContent } from "./display-types";
import { RenderContent } from "./display-utils";
defineProps<{
  title?: DisplayContent;
  description?: DisplayContent;
  footer?: DisplayContent;
  className?: string;
}>();
</script>
<template>
  <section :class="['cr-card', className]">
    <header
      v-if="title || description || $slots.title || $slots.description"
      class="cr-card-header"
    >
      <h3 v-if="title || $slots.title" class="cr-card-title">
        <slot name="title"><RenderContent :content="title" /></slot>
      </h3>
      <p v-if="description || $slots.description" class="cr-description">
        <slot name="description"><RenderContent :content="description" /></slot>
      </p>
    </header>
    <div class="cr-card-body"><slot /></div>
    <footer v-if="footer || $slots.footer" class="cr-card-footer">
      <slot name="footer"><RenderContent :content="footer" /></slot>
    </footer>
  </section>
</template>
