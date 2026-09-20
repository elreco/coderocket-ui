<script setup lang="ts">
import { provide, ref } from "vue";
import { PortalContainerKey, cx } from "./utils";
defineProps<{ className?: string }>();
const container = ref<HTMLElement>();
provide(PortalContainerKey, container);
defineExpose({ container });
</script>
<template>
  <div ref="container" :class="cx('cr-theme', className)"><slot /></div>
</template>
