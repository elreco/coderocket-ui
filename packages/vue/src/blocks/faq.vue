<script setup lang="ts">
import { computed } from "vue";
import { ArrowUpRight } from "@lucide/vue";
import Accordion from "../components/accordion.vue";
import type { DisplayContent } from "../components/display-types";
import { RenderContent } from "../components/display-utils";
import MarketingHeading from "./marketing-heading.vue";
const props = defineProps<{
  title: string;
  eyebrow?: string;
  description?: string;
  contact?: { label: string; href: string };
  items: readonly { question: string; answer: DisplayContent }[];
}>();
const accordionItems = computed(() =>
  props.items.map((item, index) => ({
    value: String(index),
    title: item.question,
    content: item.answer,
  })),
);
</script>
<template>
  <section class="cr-marketing-section cr-faq-section">
    <div class="cr-faq-layout">
      <div class="cr-faq-intro">
        <MarketingHeading
          :title="title"
          :description="description"
          :eyebrow="eyebrow"
        /><a v-if="contact" class="cr-feature-link" :href="contact.href"
          >{{ contact.label
          }}<ArrowUpRight :size="16" :stroke-width="1.75" aria-hidden="true"
        /></a>
      </div>
      <div class="cr-faq-content">
        <Accordion :items="accordionItems"
          ><template #content="{ item }"
            ><slot
              name="answer"
              :item="items[Number(item.value)]"
              :index="Number(item.value)"
              ><RenderContent :content="item.content" /></slot></template
        ></Accordion>
      </div>
    </div>
  </section>
</template>
