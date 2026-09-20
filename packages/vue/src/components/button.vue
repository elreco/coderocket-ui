<script setup lang="ts">
import { Primitive } from "reka-ui";
import { cx } from "./utils";
const props = withDefaults(
  defineProps<{
    variant?:
      "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    as?: string;
    asChild?: boolean;
  }>(),
  { variant: "primary", size: "md", type: "button", as: "button" },
);
function blockDisabled(event: Event) {
  if (!props.disabled && !props.loading) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
</script>
<template>
  <Primitive
    @click.capture="blockDisabled"
    @keydown.capture="(disabled || loading) && blockDisabled($event)"
    :tabindex="disabled || loading ? -1 : undefined"
    :as="as"
    :as-child="asChild"
    :type="type"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
    :class="cx('cr-button', className)"
    :data-variant="variant"
    :data-size="size"
    ><span
      v-if="loading && !asChild"
      class="cr-spinner"
      aria-hidden="true" /><slot
  /></Primitive>
</template>
