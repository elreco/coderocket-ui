<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Dialog from "../components/dialog.vue";
import Button from "../components/button.vue";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import Avatar from "../components/avatar.vue";
import Badge from "../components/badge.vue";
import { UserRoundPlus, UsersRound, Trash2 } from "@lucide/vue";
import { ref } from "vue";
import type { TeamMember } from "./common";
const props = defineProps<{
  members: TeamMember[];
  onInvite: FormAction;
  onRemove: (id: string) => void | Promise<void>;
}>();
const removing = ref<string | null>(null),
  error = ref(false);
async function remove(id: string) {
  if (removing.value) return;
  removing.value = id;
  error.value = false;
  try {
    await props.onRemove(id);
  } catch {
    error.value = true;
  } finally {
    removing.value = null;
  }
}
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-team"
    ><WorkspaceHeading
      eyebrow="People &amp; access"
      title="Your team"
      description="Good work starts with the right people."
      ><template #action
        ><Dialog
          title="Invite someone to your team"
          description="Enter the email address of the person you’d like to invite."
          :footer="null"
          ><template #trigger
            ><Button variant="outline"
              ><UserRoundPlus :size="16" aria-hidden="true" />Invite
              member</Button
            ></template
          ><ActionForm
            :on-submit="onInvite"
            submit-label="Send invitation"
            success-message="Invitation sent."
            ><Field label="Email address"
              ><Input
                name="email"
                type="email"
                autocomplete="email"
                placeholder="colleague@company.com"
                required /></Field></ActionForm></Dialog></template
    ></WorkspaceHeading>
    <div class="cr-workspace-list-heading">
      <span><UsersRound :size="15" aria-hidden="true" />Team members</span
      ><Badge variant="outline"
        >{{ members.length }}
        {{ members.length === 1 ? "member" : "members" }}</Badge
      >
    </div>
    <ul class="cr-workspace-list cr-workspace-member-list">
      <li v-for="member in members" :key="member.id">
        <Avatar :name="member.name" :size="36" />
        <div class="cr-workspace-person">
          <strong>{{ member.name }}</strong
          ><span>{{ member.email }}</span>
        </div>
        <Badge variant="outline">{{ member.role }}</Badge
        ><Button
          variant="ghost"
          size="sm"
          class="cr-workspace-icon-button"
          :disabled="!!removing"
          :loading="removing === member.id"
          :aria-label="`Remove ${member.name}`"
          @click="remove(member.id)"
          ><Trash2 v-if="removing !== member.id" :size="16" aria-hidden="true"
        /></Button>
      </li>
    </ul>
    <p v-if="!members.length" class="cr-block-empty">
      No team members yet. Invite someone to get started.
    </p>
    <p v-if="error" role="alert" class="cr-description">
      Unable to remove this member.
    </p></Card
  >
</template>
