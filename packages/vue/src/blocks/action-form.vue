<script setup lang="ts">
import Alert from "../components/alert.vue";
import Button from "../components/button.vue";
import { ref } from "vue";
import type { FormAction } from "./common";
const props = withDefaults(
  defineProps<{
    onSubmit: FormAction;
    submitLabel?: string;
    successMessage?: string;
    validate?: (values: FormData) => string | undefined;
  }>(),
  { submitLabel: "Save changes", successMessage: "Saved." },
);
const state = ref<"idle" | "busy" | "success" | "error">("idle");
const errorMessage = ref("Please try again.");
let pending = false;
async function submit(event: Event) {
  event.preventDefault();
  if (pending) return;
  pending = true;
  state.value = "busy";
  errorMessage.value = "Please try again.";
  const data = new FormData(event.currentTarget as HTMLFormElement);
  try {
    const error = props.validate?.(data);
    if (error) {
      errorMessage.value = error;
      state.value = "error";
      return;
    }
    await props.onSubmit(data);
    state.value = "success";
  } catch {
    state.value = "error";
  } finally {
    pending = false;
  }
}
</script>
<template>
  <form
    class="cr-stack cr-block-action-form"
    :aria-busy="state === 'busy' || undefined"
    @submit="submit"
    @input="!pending && (state = 'idle')"
    @change="!pending && (state = 'idle')"
  >
    <slot /><Button type="submit" :loading="state === 'busy'"
      >{{ submitLabel }}<slot v-if="state !== 'busy'" name="submit-icon"
    /></Button>
    <p v-if="state === 'success'" role="status" class="cr-description">
      {{ successMessage }}
    </p>
    <Alert
      v-if="state === 'error'"
      title="Unable to complete this action"
      variant="destructive"
      announce
      >{{ errorMessage }}</Alert
    >
  </form>
</template>
