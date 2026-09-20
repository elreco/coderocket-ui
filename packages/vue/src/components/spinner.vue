<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Loading" });
</script>
<template>
  <span class="cr-spinner-container" role="status"
    ><span class="cr-spinner" aria-hidden="true" /><span class="cr-sr-only">{{
      label
    }}</span></span
  >
</template>
