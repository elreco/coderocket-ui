<script setup lang="ts">
defineProps<{ title: string; description?: string; eyebrow?: string }>();
</script>
<template>
  <header class="cr-marketing-heading">
    <div>
      <p v-if="eyebrow" class="cr-marketing-eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
    </div>
    <p v-if="description" class="cr-description">{{ description }}</p>
  </header>
</template>
