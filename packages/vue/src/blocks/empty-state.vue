<script setup lang="ts">
import Card from "../components/card.vue";
import EmptyState from "../components/empty-state.vue";
import Button from "../components/button.vue";
import { FolderPlus, Plus } from "@lucide/vue";
defineProps<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}>();
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-empty-block"
    ><EmptyState :title="title" :description="description"
      ><template #icon
        ><span class="cr-workspace-empty-illustration"
          ><span /><span /><span
            ><FolderPlus
              :size="30"
              :stroke-width="1.5"
              aria-hidden="true" /></span></span></template
      ><template #action
        ><Button @click="onAction"
          ><Plus :size="16" aria-hidden="true" />{{ actionLabel }}</Button
        ></template
      ></EmptyState
    ></Card
  >
</template>
