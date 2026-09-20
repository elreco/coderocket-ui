<script setup lang="ts">
import {
  ArrowUpRight,
  Layers3,
  SlidersHorizontal,
  Workflow,
} from "@lucide/vue";
import Card from "../components/card.vue";
import type { DisplayContent } from "../components/display-types";
import { RenderContent } from "../components/display-utils";
import MarketingHeading from "./marketing-heading.vue";
defineProps<{
  title: string;
  description: string;
  eyebrow?: string;
  items: readonly {
    title: string;
    description: string;
    icon?: DisplayContent;
    visual?: DisplayContent;
    eyebrow?: string;
    href?: string;
    linkLabel?: string;
  }[];
}>();
const fallbackIcons = [Layers3, Workflow, SlidersHorizontal];
</script>
<template>
  <section class="cr-marketing-section cr-features-section">
    <MarketingHeading
      :title="title"
      :description="description"
      :eyebrow="eyebrow"
    />
    <div class="cr-features-grid">
      <Card
        v-for="(item, index) in items"
        :key="item.title"
        class-name="cr-feature-card"
        :data-featured="index === 0 && items.length >= 3 ? '' : undefined"
        :data-has-visual="item.visual || $slots.visual ? '' : undefined"
        ><div class="cr-feature-copy">
          <div class="cr-feature-topline">
            <span aria-hidden="true" class="cr-feature-icon"
              ><slot name="icon" :item="item" :index="index"
                ><RenderContent
                  v-if="item.icon"
                  :content="item.icon" /><component
                  :is="fallbackIcons[index % fallbackIcons.length]"
                  v-else
                  :size="22"
                  :stroke-width="1.75" /></slot></span
            ><span class="cr-feature-index" aria-hidden="true">{{
              String(index + 1).padStart(2, "0")
            }}</span>
          </div>
          <p v-if="item.eyebrow" class="cr-marketing-eyebrow">
            {{ item.eyebrow }}
          </p>
          <h3>{{ item.title }}</h3>
          <p class="cr-description">{{ item.description }}</p>
          <a v-if="item.href" class="cr-feature-link" :href="item.href"
            >{{ item.linkLabel ?? "Explore feature"
            }}<ArrowUpRight :size="16" :stroke-width="1.75" aria-hidden="true"
          /></a>
        </div>
        <div v-if="item.visual || $slots.visual" class="cr-feature-visual">
          <slot name="visual" :item="item" :index="index"
            ><RenderContent :content="item.visual"
          /></slot></div
      ></Card>
    </div>
  </section>
</template>
