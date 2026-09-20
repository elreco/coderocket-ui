<script setup lang="ts">
import WorkspaceHeading from "./workspace-heading.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Card from "../components/card.vue";
import Dialog from "../components/dialog.vue";
import Button from "../components/button.vue";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import Badge from "../components/badge.vue";
import { ref } from "vue";
import { Plus, ShieldCheck, KeyRound } from "@lucide/vue";
const props = defineProps<{
  keys: Array<{ id: string; name: string; prefix: string; created: string }>;
  onCreate: FormAction;
  onRevoke: (id: string) => void | Promise<void>;
}>();
const error = ref(false),
  busy = ref<string | null>(null);
async function revoke(id: string) {
  if (busy.value) return;
  busy.value = id;
  error.value = false;
  try {
    await props.onRevoke(id);
  } catch {
    error.value = true;
  } finally {
    busy.value = null;
  }
}
</script>
<template>
  <Card class="cr-workspace-block cr-workspace-keys"
    ><WorkspaceHeading
      eyebrow="Developer settings"
      title="API keys"
      description="Connect your tools to your workspace."
      ><template #action
        ><Dialog
          title="Create an API key"
          description="Give this key a name that helps you recognize its integration."
          :footer="null"
          ><template #trigger
            ><Button variant="outline"
              ><Plus :size="16" aria-hidden="true" />Create key</Button
            ></template
          ><ActionForm
            :on-submit="onCreate"
            submit-label="Create key"
            success-message="Key created. Follow your application’s secure delivery flow."
            ><Field label="Key name"
              ><Input
                name="name"
                required
                placeholder="Production integration" /></Field></ActionForm></Dialog></template
    ></WorkspaceHeading>
    <div class="cr-workspace-security-note">
      <ShieldCheck :size="17" aria-hidden="true" /><span
        >Use keys on your server. Keep them out of public repositories and
        client-side code.</span
      >
    </div>
    <div class="cr-workspace-list-heading">
      <span>Secret keys</span><Badge variant="outline">{{ keys.length }}</Badge>
    </div>
    <ul class="cr-workspace-list cr-workspace-key-list">
      <li v-for="key in keys" :key="key.id">
        <span class="cr-workspace-icon-tile"
          ><KeyRound :size="18" aria-hidden="true"
        /></span>
        <div class="cr-workspace-person">
          <strong>{{ key.name }}</strong
          ><span
            ><code>{{ key.prefix }}••••</code
            ><span class="cr-workspace-key-date"
              >Created {{ key.created }}</span
            ></span
          >
        </div>
        <Button
          variant="ghost"
          size="sm"
          :disabled="!!busy"
          :loading="busy === key.id"
          :aria-label="`Revoke ${key.name}`"
          @click="revoke(key.id)"
          >Revoke</Button
        >
      </li>
    </ul>
    <p v-if="!keys.length" class="cr-block-empty">
      No API keys yet. Create a key to connect an integration.
    </p>
    <p v-if="error" role="alert" class="cr-description">
      Unable to revoke this key.
    </p></Card
  >
</template>
