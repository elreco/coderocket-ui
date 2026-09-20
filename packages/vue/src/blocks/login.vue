<script setup lang="ts">
import AuthFrame from "./auth-frame.vue";
import ActionForm from "./action-form.vue";
import PasswordInput from "./password-input.vue";
import type { FormAction } from "./common";
import Field from "../components/field.vue";
import InputGroup from "../components/input-group.vue";
import { ArrowRight, LockKeyhole, Mail } from "@lucide/vue";
defineProps<{ onSubmit: FormAction; signupHref: string; forgotHref: string }>();
</script>
<template>
  <AuthFrame
    title="Welcome back."
    description="Sign in to your workspace and pick up where you left off."
    eyebrow="Your workspace"
    ><template #icon><LockKeyhole :size="24" :stroke-width="1.75" /></template
    ><ActionForm
      :on-submit="onSubmit"
      submit-label="Sign in"
      success-message="Signed in."
      ><Field label="Email address"
        ><InputGroup
          name="email"
          type="email"
          autocomplete="email"
          required
          placeholder="you@company.com"
          ><template #leading
            ><Mail
              :size="16"
              aria-hidden="true" /></template></InputGroup></Field
      ><Field label="Password"
        ><PasswordInput name="password" auto-complete="current-password"
      /></Field>
      <div class="cr-auth-assistance">
        <a class="cr-auth-link" :href="forgotHref">Forgot password?</a>
      </div>
      <template #submit-icon
        ><ArrowRight :size="17" aria-hidden="true" /></template></ActionForm
    ><template #footer
      ><p class="cr-auth-footer">
        New here?
        <a class="cr-auth-link" :href="signupHref"
          >Create an account <ArrowRight :size="14" aria-hidden="true"
        /></a></p></template
  ></AuthFrame>
</template>
