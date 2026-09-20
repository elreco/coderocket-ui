<script setup lang="ts">
import Card from "../components/card.vue";
import { useId } from "vue";
defineProps<{ title: string; description: string; eyebrow: string }>();
const titleId = useId();
</script>
<template>
  <div class="cr-block-form cr-auth-shell">
    <Card class="cr-auth-card" :aria-labelledby="titleId"
      ><header class="cr-auth-header">
        <div class="cr-auth-intro">
          <span class="cr-auth-symbol" aria-hidden="true"
            ><slot name="icon" /></span
          ><span class="cr-auth-eyebrow">{{ eyebrow }}</span>
        </div>
        <h2 :id="titleId" class="cr-auth-title">{{ title }}</h2>
        <p class="cr-auth-description">{{ description }}</p>
      </header>
      <slot /><template v-if="$slots.footer" #footer
        ><slot name="footer" /></template
    ></Card>
  </div>
</template>
