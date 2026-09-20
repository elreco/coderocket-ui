<script setup lang="ts">
defineProps<{ className?: string }>();
</script>
<template>
  <kbd :class="['cr-kbd', className]"><slot /></kbd>
</template>
