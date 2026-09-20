<script setup lang="ts">
import AuthFrame from "./auth-frame.vue";
import ActionForm from "./action-form.vue";
import PasswordInput from "./password-input.vue";
import type { FormAction } from "./common";
import Field from "../components/field.vue";
import InputGroup from "../components/input-group.vue";
import { ArrowRight, UserRound, Mail } from "@lucide/vue";
defineProps<{ onSubmit: FormAction; loginHref: string }>();
</script>
<template>
  <AuthFrame
    title="Make room for what’s next."
    description="Create your account. A fresh workspace starts here."
    eyebrow="A new beginning"
    ><template #icon><UserRound :size="23" :stroke-width="1.75" /></template
    ><ActionForm
      :on-submit="onSubmit"
      submit-label="Create account"
      success-message="Check your inbox to confirm your email address."
      ><Field label="Full name"
        ><InputGroup
          name="name"
          autocomplete="name"
          required
          placeholder="Your full name"
          ><template #leading
            ><UserRound
              :size="16"
              aria-hidden="true" /></template></InputGroup></Field
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
      ><Field label="Password" description="Use at least 12 characters."
        ><PasswordInput
          name="password"
          auto-complete="new-password"
          :min-length="12"
          placeholder="Create a password" /></Field
      ><template #submit-icon
        ><ArrowRight :size="17" aria-hidden="true" /></template></ActionForm
    ><template #footer
      ><p class="cr-auth-footer">
        Already have an account?
        <a class="cr-auth-link" :href="loginHref"
          >Sign in <ArrowRight :size="14" aria-hidden="true"
        /></a></p></template
  ></AuthFrame>
</template>
