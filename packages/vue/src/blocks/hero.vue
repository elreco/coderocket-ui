<script setup lang="ts">
import {
  ArrowRight,
  ArrowUpRight,
  Layers3,
  SlidersHorizontal,
  Workflow,
} from "@lucide/vue";
import Badge from "../components/badge.vue";
defineProps<{
  eyebrow: string;
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}>();
</script>
<template>
  <section class="cr-hero cr-marketing-hero">
    <div class="cr-hero-decoration" aria-hidden="true">
      <span><Layers3 :stroke-width="1.75" /></span
      ><span><SlidersHorizontal :stroke-width="1.75" /></span
      ><span><Workflow :stroke-width="1.75" /></span>
    </div>
    <div class="cr-hero-content">
      <Badge variant="outline"
        >{{ eyebrow
        }}<ArrowUpRight :size="13" :stroke-width="1.75" aria-hidden="true"
      /></Badge>
      <h1>{{ title }}</h1>
      <p class="cr-description">{{ description }}</p>
      <div class="cr-hero-actions">
        <a class="cr-button" :href="primary.href"
          >{{ primary.label
          }}<ArrowRight :size="17" :stroke-width="1.75" aria-hidden="true" /></a
        ><a
          v-if="secondary"
          class="cr-button"
          data-variant="ghost"
          :href="secondary.href"
          >{{ secondary.label
          }}<ArrowUpRight :size="16" :stroke-width="1.75" aria-hidden="true"
        /></a>
      </div>
    </div>
    <div v-if="$slots.default" class="cr-hero-media"><slot /></div>
  </section>
</template>
