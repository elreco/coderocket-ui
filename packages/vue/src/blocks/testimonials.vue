<script setup lang="ts">
import { Quote } from "@lucide/vue";
import Card from "../components/card.vue";
import Avatar from "../components/avatar.vue";
import MarketingHeading from "./marketing-heading.vue";
defineProps<{
  title: string;
  eyebrow?: string;
  description?: string;
  quotes: readonly {
    quote: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
}>();
</script>
<template>
  <section class="cr-marketing-section cr-testimonials-section">
    <MarketingHeading
      :title="title"
      :description="description"
      :eyebrow="eyebrow"
    />
    <div class="cr-testimonials-grid">
      <Card
        v-for="(quote, index) in quotes"
        :key="quote.name"
        class-name="cr-testimonial-card"
        :data-featured="index === 0 ? '' : undefined"
        ><figure class="cr-testimonial-figure">
          <Quote
            class="cr-quote-icon"
            :size="26"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          <blockquote class="cr-quote">
            <p>{{ quote.quote }}</p>
          </blockquote>
          <figcaption class="cr-quote-author">
            <Avatar :name="quote.name" :src="quote.avatar" :size="40" />
            <div>
              <cite>{{ quote.name }}</cite>
              <p class="cr-description">{{ quote.role }}</p>
            </div>
          </figcaption>
        </figure></Card
      >
    </div>
  </section>
</template>
