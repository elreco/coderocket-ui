<script setup lang="ts">
defineProps<{ className?: string }>();
</script>
<template>
  <div :class="['cr-skeleton', className]" aria-hidden="true"><slot /></div>
</template>
