<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "destructive"
      | "outline";
    className?: string;
  }>(),
  { variant: "secondary" },
);
</script>
<template>
  <span :class="['cr-badge', className]" :data-variant="variant"><slot /></span>
</template>
