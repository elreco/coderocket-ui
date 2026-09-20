<script setup lang="ts">
import InputGroup from "../components/input-group.vue";
import Button from "../components/button.vue";
import { ref } from "vue";
import { LockKeyhole, Eye, EyeOff } from "@lucide/vue";
withDefaults(
  defineProps<{
    name: string;
    autoComplete: "current-password" | "new-password";
    minLength?: number;
    placeholder?: string;
  }>(),
  { placeholder: "Enter your password" },
);
const visible = ref(false);
</script>
<template>
  <InputGroup
    :name="name"
    :type="visible ? 'text' : 'password'"
    :autocomplete="autoComplete"
    :minlength="minLength"
    required
    :placeholder="placeholder"
    ><template #leading><LockKeyhole :size="16" aria-hidden="true" /></template
    ><template #trailing
      ><Button
        type="button"
        variant="ghost"
        class="cr-auth-password-toggle"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        @click="visible = !visible"
        ><EyeOff v-if="visible" :size="16" aria-hidden="true" /><Eye
          v-else
          :size="16"
          aria-hidden="true" /></Button></template
  ></InputGroup>
</template>
