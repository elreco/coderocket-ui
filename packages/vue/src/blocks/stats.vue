<script setup lang="ts">
import Card from "../components/card.vue";
import Badge from "../components/badge.vue";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  Minus,
} from "@lucide/vue";
import { RenderContent } from "../components/display-utils";
import type { DisplayContent } from "../components/display-types";
defineProps<{
  items: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: "positive" | "negative" | "neutral";
    description?: string;
    icon?: DisplayContent;
  }>;
}>();
</script>
<template>
  <div class="cr-block-grid cr-workspace-stats">
    <Card v-for="item in items" :key="item.label" class="cr-workspace-stat-card"
      ><div class="cr-workspace-stat-heading">
        <span>{{ item.label }}</span
        ><span class="cr-workspace-stat-icon" aria-hidden="true"
          ><slot name="icon" :item="item"
            ><RenderContent
              v-if="item.icon"
              :content="item.icon" /><ChartNoAxesColumn
              v-else
              :size="17" /></slot
        ></span>
      </div>
      <strong class="cr-stat-value">{{ item.value }}</strong>
      <div
        v-if="item.change || item.description"
        class="cr-workspace-stat-footer"
      >
        <Badge
          v-if="item.change"
          variant="outline"
          class="cr-workspace-stat-change"
          :data-trend="item.trend ?? 'neutral'"
          ><ArrowUpRight
            v-if="item.trend === 'positive'"
            :size="13"
            aria-hidden="true"
          /><ArrowDownRight
            v-else-if="item.trend === 'negative'"
            :size="13"
            aria-hidden="true"
          /><Minus v-else :size="13" aria-hidden="true" />{{
            item.change
          }}</Badge
        ><span v-if="item.description">{{ item.description }}</span>
      </div></Card
    >
  </div>
</template>
