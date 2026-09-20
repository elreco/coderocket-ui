<script setup lang="ts">
import AuthFrame from "./auth-frame.vue";
import ActionForm from "./action-form.vue";
import type { FormAction } from "./common";
import Field from "../components/field.vue";
import Input from "../components/input.vue";
import { ArrowRight, Mail } from "@lucide/vue";
import { computed } from "vue";
const props = withDefaults(
  defineProps<{ onSubmit: FormAction; length?: number }>(),
  { length: 6 },
);
const size = computed(() =>
  Number.isFinite(props.length)
    ? Math.max(4, Math.min(10, Math.floor(props.length)))
    : 6,
);
const pattern = computed(() => `[0-9]{${size.value}}`);
</script>
<template>
  <AuthFrame
    title="Check your inbox."
    :description="`Enter the ${size}-digit verification code from your email to continue.`"
    eyebrow="One more step"
    ><template #icon><Mail :size="24" :stroke-width="1.75" /></template
    ><ActionForm
      :on-submit="onSubmit"
      submit-label="Verify code"
      success-message="Code verified."
      ><Field
        label="Verification code"
        description="You can paste the entire code into this field."
        ><Input
          name="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          :minlength="size"
          :maxlength="size"
          :pattern="pattern"
          required
          class="cr-otp"
          :placeholder="'0'.repeat(size)"
          :style="{ '--cr-otp-length': size }" /></Field
      ><template #submit-icon
        ><ArrowRight :size="17" aria-hidden="true" /></template></ActionForm
  ></AuthFrame>
</template>
