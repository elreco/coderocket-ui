<script setup lang="ts">
import { ArrowRight, Check } from "@lucide/vue";
import Badge from "../components/badge.vue";
import Card from "../components/card.vue";
import MarketingHeading from "./marketing-heading.vue";
defineProps<{
  title: string;
  eyebrow?: string;
  description?: string;
  plans: readonly {
    name: string;
    price: string;
    period: string;
    description: string;
    features: readonly string[];
    href: string;
    action: string;
    featured?: boolean;
  }[];
}>();
</script>
<template>
  <section class="cr-marketing-section cr-pricing-section">
    <MarketingHeading
      :title="title"
      :description="description"
      :eyebrow="eyebrow"
    />
    <div class="cr-pricing-grid">
      <Card
        v-for="plan in plans"
        :key="plan.name"
        class-name="cr-pricing-card"
        :data-featured="plan.featured ? '' : undefined"
        ><div class="cr-plan-heading">
          <h3>{{ plan.name }}</h3>
          <div
            class="cr-price-recommendation"
            :aria-hidden="!plan.featured || undefined"
          >
            <Badge v-if="plan.featured" variant="primary">Recommended</Badge>
          </div>
        </div>
        <p class="cr-plan-description cr-description">{{ plan.description }}</p>
        <p class="cr-price">
          {{ plan.price }}<small>{{ plan.period }}</small>
        </p>
        <ul class="cr-price-features">
          <li v-for="feature in plan.features" :key="feature">
            <Check :size="17" :stroke-width="1.75" aria-hidden="true" /><span>{{
              feature
            }}</span>
          </li>
        </ul>
        <a
          class="cr-button"
          :data-variant="plan.featured ? 'primary' : 'outline'"
          :href="plan.href"
          >{{ plan.action
          }}<ArrowRight :size="16" :stroke-width="1.75" aria-hidden="true" /></a
      ></Card>
    </div>
  </section>
</template>
