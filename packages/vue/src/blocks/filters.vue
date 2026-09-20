<script setup lang="ts">
import Card from "../components/card.vue";
import Badge from "../components/badge.vue";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import Select from "../components/select.vue";
import Button from "../components/button.vue";
import { computed, ref } from "vue";
import { ListFilter, Search, X } from "@lucide/vue";
const props = defineProps<{
  onChange: (filters: { query: string; status: string }) => void;
  statuses: Array<{ value: string; label: string }>;
}>();
const query = ref<string | number>(""),
  status = ref("all");
const active = computed(
  () => Number(Boolean(query.value)) + Number(status.value !== "all"),
);
const options = computed(() => [
  { value: "all", label: "All statuses" },
  ...props.statuses.filter((item) => item.value !== "all"),
]);
function change() {
  props.onChange({ query: String(query.value), status: status.value });
}
function clear() {
  query.value = "";
  status.value = "all";
  change();
}
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-filter-block"
    ><div class="cr-workspace-filter-heading">
      <span
        ><ListFilter :size="17" aria-hidden="true" /><strong
          >Filter records</strong
        ></span
      ><Badge v-if="active > 0" variant="outline">{{ active }} active</Badge>
    </div>
    <div class="cr-block-filters cr-workspace-filters">
      <Field label="Search"
        ><div class="cr-workspace-search-field">
          <Search :size="17" aria-hidden="true" /><Input
            v-model="query"
            type="search"
            placeholder="Name or keyword…"
            @update:model-value="change"
          /></div></Field
      ><Field label="Status"
        ><Select
          v-model="status"
          label="Status"
          :options="options"
          @update:model-value="change" /></Field
      ><Button variant="ghost" :disabled="!active" @click="clear"
        ><X :size="15" aria-hidden="true" />Clear filters</Button
      >
    </div></Card
  >
</template>
