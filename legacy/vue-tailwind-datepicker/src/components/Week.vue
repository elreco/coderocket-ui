<script setup lang="ts">
import type { LengthArray } from '../types'

defineProps<{
  weeks: LengthArray<string, 7>
}>()
</script>

<template>
  <div class="grid grid-cols-7 py-2 mt-0.5">
    <div
      v-for="(day, keyDay) in weeks"
      :key="keyDay"
      class="text-vtd-secondary-500 text-xs 2xl:text-sm tracking-wide font-medium text-center cursor-default dark:text-vtd-secondary-400"
    >
      <span v-text="day" />
    </div>
  </div>
</template>
