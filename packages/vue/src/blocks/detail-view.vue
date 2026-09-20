<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Button from "../components/button.vue";
import Badge from "../components/badge.vue";
import Separator from "../components/separator.vue";
import { Pencil } from "@lucide/vue";
defineProps<{
  title: string;
  status: string;
  fields: Array<{ label: string; value: string }>;
  onEdit: () => void;
}>();
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-detail"
    ><WorkspaceHeading eyebrow="Record overview" :title="title"
      ><template #action
        ><Button variant="outline" @click="onEdit"
          ><Pencil :size="15" aria-hidden="true" />Edit details</Button
        ></template
      ></WorkspaceHeading
    >
    <div class="cr-workspace-detail-status">
      <span>Status</span
      ><Badge variant="outline"
        ><span class="cr-workspace-status-dot" aria-hidden="true" />{{
          status
        }}</Badge
      >
    </div>
    <dl class="cr-details cr-workspace-details">
      <div v-for="field in fields" :key="field.label">
        <dt>{{ field.label }}</dt>
        <dd>{{ field.value }}</dd>
      </div>
    </dl>
    <div v-if="$slots.default" class="cr-workspace-detail-content">
      <Separator /><slot /></div
  ></Card>
</template>
