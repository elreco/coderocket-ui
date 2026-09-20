<script setup lang="ts">
import { Label } from "reka-ui";
import { cx } from "./utils";
defineProps<{ htmlFor?: string; className?: string }>();
</script>
<template>
  <Label :for="htmlFor" :class="cx('cr-label', className)"><slot /></Label>
</template>
