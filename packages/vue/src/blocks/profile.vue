<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Avatar from "../components/avatar.vue";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import Textarea from "../components/textarea.vue";
import { UserRound } from "@lucide/vue";
withDefaults(
  defineProps<{
    name: string;
    email: string;
    bio?: string;
    onSave: FormAction;
  }>(),
  { bio: "" },
);
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-profile"
    ><WorkspaceHeading
      eyebrow="Account"
      title="Your profile"
      description="The details your team sees when you work together." />
    <div class="cr-workspace-identity">
      <Avatar :name="name" :size="58" />
      <div>
        <strong>{{ name }}</strong
        ><span>{{ email }}</span>
      </div>
      <span class="cr-workspace-icon-tile"
        ><UserRound :size="20" aria-hidden="true"
      /></span>
    </div>
    <ActionForm :on-submit="onSave"
      ><div class="cr-workspace-form-grid">
        <Field label="Display name"
          ><Input
            name="name"
            :default-value="name"
            autocomplete="name"
            required /></Field
        ><Field label="Email address"
          ><Input
            name="email"
            type="email"
            :default-value="email"
            autocomplete="email"
            required
        /></Field>
      </div>
      <Field label="About you"
        ><Textarea
          name="bio"
          :default-value="bio"
          placeholder="A few words about you and your work." /></Field></ActionForm
  ></Card>
</template>
