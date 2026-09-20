<script setup lang="ts">
import {
  Layers3,
  Search,
  LayoutDashboard,
  Folder,
  UsersRound,
  Settings2,
  Plus,
  PanelLeft,
  Palette,
  Clock3,
} from "@lucide/vue";
const projects = [
  { name: "Customer portal", status: "In review", icon: PanelLeft },
  { name: "Brand refresh", status: "In progress", icon: Palette },
  { name: "Next release", status: "Planned", icon: Clock3 },
];
</script>
<template>
  <div class="cr-demo-workspace" aria-hidden="true">
    <div class="cr-demo-workspace-bar">
      <span><Layers3 :size="16" />Orbit workspace</span
      ><span
        ><Search :size="14" /><span class="cr-demo-shortcut">⌘ K</span></span
      >
    </div>
    <div class="cr-demo-workspace-body">
      <div class="cr-demo-workspace-nav">
        <span data-active="true"><LayoutDashboard :size="14" />Overview</span
        ><span><Folder :size="14" />Projects</span
        ><span><UsersRound :size="14" />Team</span
        ><span><Settings2 :size="14" />Settings</span>
      </div>
      <div class="cr-demo-workspace-main">
        <div class="cr-demo-workspace-title">
          <span
            ><small>YOUR WORKSPACE</small
            ><strong>A little more clarity.</strong></span
          ><span class="cr-demo-workspace-create"
            ><Plus :size="13" />New project</span
          >
        </div>
        <div class="cr-demo-workspace-projects">
          <div v-for="project in projects" :key="project.name">
            <span class="cr-demo-mini-icon"
              ><component :is="project.icon" :size="18" /></span
            ><strong>{{ project.name }}</strong
            ><span>{{ project.status }}</span>
            <div class="cr-demo-workspace-progress"><i /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
