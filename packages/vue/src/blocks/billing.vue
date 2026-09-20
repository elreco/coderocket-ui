<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Badge from "../components/badge.vue";
import Button from "../components/button.vue";
import Progress from "../components/progress.vue";
import { computed } from "vue";
import { CreditCard, ArrowUpRight, FileText } from "@lucide/vue";
const props = defineProps<{
  plan: string;
  price: string;
  renewal: string;
  usage: number;
  limit: number;
  onManage: () => void;
  invoices: Array<{ id: string; date: string; amount: string; href: string }>;
}>();
const safeLimit = computed(() =>
  Number.isFinite(props.limit) && props.limit > 0 ? props.limit : 1,
);
const safeUsage = computed(() =>
  Number.isFinite(props.usage)
    ? Math.max(0, Math.min(props.usage, safeLimit.value))
    : 0,
);
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-billing"
    ><WorkspaceHeading
      eyebrow="Subscription"
      title="Billing"
      description="Your plan, usage and invoices in one place."
      ><template #action
        ><span class="cr-workspace-icon-tile"
          ><CreditCard :size="20" aria-hidden="true" /></span></template
    ></WorkspaceHeading>
    <div class="cr-workspace-plan">
      <div class="cr-workspace-plan-main">
        <Badge variant="outline">{{ plan }} plan</Badge
        ><strong class="cr-workspace-plan-price">{{ price }}</strong
        ><span class="cr-description">{{ renewal }}</span>
      </div>
      <Button variant="outline" @click="onManage"
        >Manage plan<ArrowUpRight :size="16" aria-hidden="true"
      /></Button>
    </div>
    <div class="cr-workspace-usage">
      <div class="cr-workspace-list-heading">
        <span>Team seats</span
        ><span
          >{{ usage }}
          <span class="cr-description">/ {{ limit }} used</span></span
        >
      </div>
      <Progress label="Seats used" :value="safeUsage" :max="safeLimit" />
    </div>
    <div class="cr-workspace-list-heading">
      <span>Invoice history</span
      ><Badge variant="outline">{{ invoices.length }}</Badge>
    </div>
    <ul class="cr-workspace-list cr-workspace-invoice-list">
      <li v-for="invoice in invoices" :key="invoice.id">
        <span class="cr-workspace-icon-tile"
          ><FileText :size="17" aria-hidden="true" /></span
        ><span>{{ invoice.date }}</span
        ><strong>{{ invoice.amount }}</strong
        ><a
          class="cr-link cr-workspace-invoice-link"
          :href="invoice.href"
          :aria-label="`View invoice dated ${invoice.date}`"
          >View<ArrowUpRight :size="15" aria-hidden="true"
        /></a>
      </li>
    </ul>
    <p v-if="!invoices.length" class="cr-block-empty">
      No invoices yet. They will appear here after your first payment.
    </p></Card
  >
</template>
