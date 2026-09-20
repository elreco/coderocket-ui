<script setup lang="ts">
import Breadcrumb from "../components/breadcrumb.vue";
import Button from "../components/button.vue";
import Dropdown from "../components/dropdown.vue";
import Avatar from "../components/avatar.vue";
import { Layers2, Search } from "@lucide/vue";
defineProps<{
  breadcrumbs: Array<{ label: string; href?: string }>;
  accountName: string;
  onSearch: () => void;
  onSignOut: () => void;
}>();
</script>
<template>
  <header class="cr-block-header cr-workspace-header">
    <div class="cr-workspace-header-location">
      <span class="cr-workspace-header-icon"
        ><Layers2 :size="18" aria-hidden="true" /></span
      ><Breadcrumb :items="breadcrumbs" />
    </div>
    <div class="cr-workspace-header-actions">
      <Button variant="ghost" @click="onSearch"
        ><Search :size="17" aria-hidden="true" /><span>Search</span></Button
      ><span class="cr-workspace-header-divider" aria-hidden="true" /><Dropdown
        :items="[{ label: 'Sign out', onSelect: onSignOut }]"
        ><template #trigger
          ><Button variant="outline"
            ><Avatar :name="accountName" :size="28" /><span
              class="cr-workspace-header-name"
              >{{ accountName }}</span
            ><span class="cr-sr-only">Account menu</span></Button
          ></template
        ></Dropdown
      >
    </div>
  </header>
</template>
