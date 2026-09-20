<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import DataTable from "../components/data-table.vue";
import Button from "../components/button.vue";
import Badge from "../components/badge.vue";
import { Plus } from "@lucide/vue";
import type { DataColumn, DataRow } from "../components/display-types";
defineProps<{
  title: string;
  description?: string;
  columns: DataColumn[];
  rows: DataRow[];
  onCreate: () => void;
}>();
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-data-table"
    ><WorkspaceHeading
      eyebrow="Workspace data"
      :title="title"
      :description="description"
      ><template #action
        ><Button @click="onCreate"
          ><Plus :size="16" aria-hidden="true" />Add record</Button
        ></template
      ></WorkspaceHeading
    >
    <div class="cr-workspace-list-heading">
      <span>All records</span
      ><Badge variant="outline"
        >{{ rows.length }} {{ rows.length === 1 ? "record" : "records" }}</Badge
      >
    </div>
    <DataTable :caption="title" :columns="columns" :rows="rows"
      ><template v-for="(_, name) in $slots" #[name]="slotProps"
        ><slot :name="name" v-bind="slotProps" /></template></DataTable
  ></Card>
</template>
