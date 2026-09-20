<script setup lang="ts">
import { computed } from "vue";
import { AvatarRoot, AvatarImage, AvatarFallback } from "reka-ui";
const props = withDefaults(
  defineProps<{
    src?: string;
    name: string;
    size?: number;
    className?: string;
  }>(),
  { size: 36 },
);
const initials = computed(
  () =>
    props.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => Array.from(word)[0] ?? "")
      .join("")
      .toLocaleUpperCase() || "?",
);
</script>
<template>
  <AvatarRoot
    :class="['cr-avatar', className]"
    :style="{ width: `${size}px`, height: `${size}px` }"
    ><AvatarImage
      :src="src ?? ''"
      :alt="name"
      class="cr-avatar-image"
    /><AvatarFallback role="img" :aria-label="name || 'Avatar'"
      ><slot name="fallback">{{ initials }}</slot></AvatarFallback
    ></AvatarRoot
  >
</template>
