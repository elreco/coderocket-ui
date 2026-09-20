<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description?: string }>();
</script>
<template>
  <header class="cr-workspace-heading">
    <div>
      <span class="cr-workspace-eyebrow">{{ eyebrow }}</span>
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="cr-workspace-heading-action">
      <slot name="action" />
    </div>
  </header>
</template>
