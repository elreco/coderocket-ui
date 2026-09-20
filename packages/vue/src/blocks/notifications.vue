<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Button from "../components/button.vue";
import Badge from "../components/badge.vue";
import { computed } from "vue";
import { CheckCheck, Bell, ChevronRight } from "@lucide/vue";
const props = defineProps<{
  items: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    unread: boolean;
  }>;
  onReadAll: () => void;
  onOpen: (id: string) => void;
}>();
const unread = computed(() => props.items.filter((item) => item.unread).length);
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-notifications"
    ><WorkspaceHeading
      eyebrow="Your inbox"
      title="Notifications"
      description="The latest from your team and workspace."
      ><template #action
        ><Button
          variant="ghost"
          size="sm"
          :disabled="!unread"
          @click="onReadAll"
          ><CheckCheck :size="16" aria-hidden="true" />Mark all read</Button
        ></template
      ></WorkspaceHeading
    >
    <div class="cr-workspace-list-heading">
      <span>Recent activity</span
      ><Badge :variant="unread ? 'primary' : 'outline'"
        >{{ unread }} unread</Badge
      >
    </div>
    <ul class="cr-workspace-list cr-workspace-notification-list">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="cr-notification-item cr-workspace-notification"
          :data-unread="item.unread || undefined"
          @click="onOpen(item.id)"
        >
          <span class="cr-workspace-icon-tile"
            ><Bell
              v-if="item.unread"
              :size="18"
              aria-hidden="true" /><CheckCheck
              v-else
              :size="18"
              aria-hidden="true" /></span
          ><span class="cr-workspace-notification-copy"
            ><strong
              >{{ item.title
              }}<template v-if="item.unread"
                ><span aria-hidden="true" class="cr-unread-dot" /><span
                  class="cr-sr-only"
                  >Unread</span
                ></template
              ></strong
            ><span class="cr-description">{{ item.description }}</span
            ><small>{{ item.time }}</small></span
          ><ChevronRight :size="16" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <div v-if="!items.length" class="cr-workspace-caught-up">
      <span class="cr-workspace-icon-tile"
        ><CheckCheck :size="22" aria-hidden="true" /></span
      ><strong>You’re all caught up.</strong>
      <p>New updates will appear here.</p>
    </div></Card
  >
</template>
