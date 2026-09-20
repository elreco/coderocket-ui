<script setup lang="ts">
import Sidebar from "../components/sidebar.vue";
import Avatar from "../components/avatar.vue";
import { Layers2, LayoutGrid } from "@lucide/vue";
import { RenderContent } from "../components/display-utils";
import type { SidebarItem } from "./common";
defineProps<{ workspace: string; items: SidebarItem[]; accountName: string }>();
</script>
<template>
  <div class="cr-app-sidebar-block">
    <Sidebar :items="items"
      ><template #brand
        ><span class="cr-workspace-brand"
          ><span class="cr-workspace-brand-icon"
            ><Layers2 :size="19" aria-hidden="true" /></span
          ><span
            ><strong>{{ workspace }}</strong
            ><small>Workspace</small></span
          ></span
        ></template
      ><template #icon="{ item }"
        ><RenderContent v-if="item.icon" :content="item.icon" /><LayoutGrid
          v-else
          :size="18"
          aria-hidden="true" /></template
      ><template #footer
        ><div class="cr-workspace-account">
          <Avatar :name="accountName" :size="34" /><span
            ><strong>{{ accountName }}</strong
            ><small>Account</small></span
          >
        </div></template
      ></Sidebar
    >
  </div>
</template>
