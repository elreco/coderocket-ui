<script setup lang="ts">
import Input from "./input.vue";
defineOptions({ inheritAttrs: false });
defineProps<{ leading?: string; trailing?: string }>();
const model = defineModel<string | number>();
</script>
<template>
  <div class="cr-input-group">
    <span v-if="leading || $slots.leading" class="cr-input-addon"
      ><slot name="leading">{{ leading }}</slot></span
    ><Input v-bind="$attrs" v-model="model" /><span
      v-if="trailing || $slots.trailing"
      class="cr-input-addon"
      ><slot name="trailing">{{ trailing }}</slot></span
    >
  </div>
</template>
