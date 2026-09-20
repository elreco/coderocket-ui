<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Input from "../components/input.vue";
import { computed, ref } from "vue";
import { Search, SearchX, FileText, ChevronRight } from "@lucide/vue";
const props = defineProps<{
  items: Array<{ id: string; title: string; description: string }>;
  onSelect: (id: string) => void;
}>();
const query = ref<string | number>("");
const results = computed(() =>
  props.items.filter((item) =>
    `${item.title} ${item.description}`
      .toLowerCase()
      .includes(String(query.value).toLowerCase()),
  ),
);
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-search-block"
    ><WorkspaceHeading
      eyebrow="Workspace search"
      title="Find your next step"
      description="Documents, projects and ideas. Right where you need them."
    />
    <div class="cr-workspace-search-field">
      <Search :size="18" aria-hidden="true" /><Input
        v-model="query"
        aria-label="Search content"
        type="search"
        placeholder="Search your workspace…"
      />
    </div>
    <div class="cr-workspace-list-heading">
      <span>{{ query ? "Matching results" : "All items" }}</span
      ><span class="cr-description" role="status"
        >{{ results.length }}
        {{ results.length === 1 ? "result" : "results" }}</span
      >
    </div>
    <ul class="cr-workspace-list cr-workspace-search-results">
      <li v-for="item in results" :key="item.id">
        <button
          type="button"
          class="cr-notification-item cr-workspace-search-result"
          @click="onSelect(item.id)"
        >
          <span class="cr-workspace-icon-tile"
            ><FileText :size="18" aria-hidden="true" /></span
          ><span
            ><strong>{{ item.title }}</strong
            ><span class="cr-description">{{ item.description }}</span></span
          ><ChevronRight :size="16" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <div v-if="!results.length" class="cr-workspace-caught-up">
      <span class="cr-workspace-icon-tile"
        ><SearchX :size="22" aria-hidden="true" /></span
      ><strong>No results found</strong>
      <p>Try a different name or keyword.</p>
    </div></Card
  >
</template>
