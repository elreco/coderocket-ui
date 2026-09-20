<script setup lang="ts">
import { computed } from "vue";
import { ProgressRoot, ProgressIndicator } from "reka-ui";
const props = withDefaults(
  defineProps<{
    label: string;
    value: number | null;
    max?: number;
    locale?: string;
  }>(),
  { max: 100, locale: "en-US" },
);
const maximum = computed(() =>
  Number.isFinite(props.max) && props.max > 0 ? props.max : 100,
);
const amount = computed(() =>
  props.value === null
    ? null
    : Math.max(
        0,
        Math.min(maximum.value, Number.isFinite(props.value) ? props.value : 0),
      ),
);
const percentage = computed(() =>
  amount.value === null
    ? undefined
    : new Intl.NumberFormat(props.locale, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(amount.value / maximum.value),
);
</script>
<template>
  <ProgressRoot
    :model-value="amount"
    :max="maximum"
    :aria-label="label"
    :get-value-label="() => percentage ?? ''"
    class="cr-progress"
    ><div class="cr-row">
      <span class="cr-label">{{ label }}</span
      ><span class="cr-description">{{ percentage }}</span>
    </div>
    <div class="cr-progress-track">
      <ProgressIndicator
        class="cr-progress-indicator"
        :style="{
          width: amount === null ? undefined : `${(amount / maximum) * 100}%`,
        }"
      /></div
  ></ProgressRoot>
</template>
