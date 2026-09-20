<script setup lang="ts">
import AuthFrame from "./auth-frame.vue";
import ActionForm from "./action-form.vue";
import PasswordInput from "./password-input.vue";
import type { FormAction } from "./common";
import Field from "../components/field.vue";
import { ArrowRight, ShieldCheck } from "@lucide/vue";
defineProps<{ onSubmit: FormAction }>();
function validate(data: FormData) {
  return data.get("password") !== data.get("confirmation")
    ? "Passwords do not match. Enter the same password in both fields."
    : undefined;
}
</script>
<template>
  <AuthFrame
    title="A fresh start."
    description="Choose a new password to get back to your workspace."
    eyebrow="Reset password"
    ><template #icon><ShieldCheck :size="24" :stroke-width="1.75" /></template
    ><ActionForm
      :on-submit="onSubmit"
      :validate="validate"
      submit-label="Update password"
      success-message="Your password has been updated."
      ><Field label="New password" description="Use at least 12 characters."
        ><PasswordInput
          name="password"
          auto-complete="new-password"
          :min-length="12"
          placeholder="Create a new password" /></Field
      ><Field label="Confirm password"
        ><PasswordInput
          name="confirmation"
          auto-complete="new-password"
          :min-length="12"
          placeholder="Enter it one more time" /></Field
      ><template #submit-icon
        ><ArrowRight :size="17" aria-hidden="true" /></template></ActionForm
  ></AuthFrame>
</template>
