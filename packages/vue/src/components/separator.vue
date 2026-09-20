<script setup lang="ts">
import { Separator } from "reka-ui";
withDefaults(
  defineProps<{
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
    className?: string;
  }>(),
  { orientation: "horizontal", decorative: false },
);
</script>
<template>
  <Separator
    :orientation="orientation"
    :decorative="decorative"
    :class="['cr-separator', className]"
  />
</template>
