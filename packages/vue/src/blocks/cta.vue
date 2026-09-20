<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from "@lucide/vue";
import Card from "../components/card.vue";
defineProps<{
  title: string;
  description: string;
  action: { label: string; href: string };
  eyebrow?: string;
  secondary?: { label: string; href: string };
}>();
</script>
<template>
  <Card class-name="cr-cta-card"
    ><div class="cr-cta">
      <div class="cr-cta-content">
        <p v-if="eyebrow" class="cr-marketing-eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p class="cr-description">{{ description }}</p>
        <div class="cr-cta-actions">
          <a class="cr-button" :href="action.href"
            >{{ action.label
            }}<ArrowRight
              :size="17"
              :stroke-width="1.75"
              aria-hidden="true" /></a
          ><a v-if="secondary" class="cr-feature-link" :href="secondary.href"
            >{{ secondary.label
            }}<ArrowUpRight :size="16" :stroke-width="1.75" aria-hidden="true"
          /></a>
        </div>
      </div>
      <div class="cr-cta-emblem" aria-hidden="true">
        <ArrowUpRight :stroke-width="1.75" />
      </div></div
  ></Card>
</template>
