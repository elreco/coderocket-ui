<script setup lang="ts">
import AuthFrame from "./auth-frame.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Field from "../components/field.vue";
import InputGroup from "../components/input-group.vue";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "@lucide/vue";
defineProps<{ onSubmit: FormAction; loginHref: string }>();
</script>
<template>
  <AuthFrame
    title="Let’s get you back in."
    description="Enter your account’s email address. We’ll send you a link to choose a new password."
    eyebrow="Account recovery"
    ><template #icon><KeyRound :size="24" :stroke-width="1.75" /></template
    ><ActionForm
      :on-submit="onSubmit"
      submit-label="Send reset link"
      success-message="If this address has an account, a reset link is on its way."
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
      ><template #submit-icon
        ><ArrowRight :size="17" aria-hidden="true" /></template></ActionForm
    ><template #footer
      ><p class="cr-auth-footer">
        <a class="cr-auth-link" :href="loginHref"
          ><ArrowLeft :size="14" aria-hidden="true" /> Back to sign in</a
        >
      </p></template
    ></AuthFrame
  >
</template>
