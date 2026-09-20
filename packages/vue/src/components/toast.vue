<script setup lang="ts">
import ToastProvider from "./toast-provider.vue";
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: "Changes saved",
  description: "Your preferences are up to date.",
});
</script>
<template>
  <ToastProvider v-slot="{ manager }"
    ><button
      type="button"
      class="cr-button"
      data-variant="primary"
      @click="manager.add({ title, description })"
    >
      <slot>Show notification</slot>
    </button></ToastProvider
  >
</template>
