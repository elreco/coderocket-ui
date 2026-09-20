<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Tabs from "../components/tabs.vue";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import Textarea from "../components/textarea.vue";
import Switch from "../components/switch.vue";
import { Building2, FileText, Bell } from "@lucide/vue";
defineProps<{
  workspaceName: string;
  onSave: FormAction;
  onNotificationSave: FormAction;
}>();
const sections = [
  { value: "general", label: "General" },
  { value: "notifications", label: "Notifications" },
];
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-settings"
    ><WorkspaceHeading
      eyebrow="Workspace"
      title="Settings"
      description="A few details that make this space yours."
      ><template #action
        ><span class="cr-workspace-icon-tile"
          ><Building2
            :size="20"
            aria-hidden="true" /></span></template></WorkspaceHeading
    ><Tabs label="Settings sections" :items="sections"
      ><template #general
        ><ActionForm :on-submit="onSave"
          ><Field label="Workspace name"
            ><Input
              name="workspace"
              :default-value="workspaceName"
              required /></Field
          ><Field label="Description"
            ><Textarea
              name="description"
              placeholder="What are you building?" /></Field></ActionForm></template
      ><template #notifications
        ><ActionForm :on-submit="onNotificationSave"
          ><div class="cr-workspace-preference">
            <div>
              <span class="cr-workspace-icon-tile"
                ><FileText :size="18" aria-hidden="true"
              /></span>
              <p>A summary of what happened across your workspace.</p>
            </div>
            <Switch name="digest" label="Weekly digest" default-checked />
          </div>
          <div class="cr-workspace-preference">
            <div>
              <span class="cr-workspace-icon-tile"
                ><Bell :size="18" aria-hidden="true"
              /></span>
              <p>Stay in the loop when someone needs your attention.</p>
            </div>
            <Switch
              name="mentions"
              label="Mention notifications"
              default-checked
            /></div></ActionForm></template></Tabs
  ></Card>
</template>
