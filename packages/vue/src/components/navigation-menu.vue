<script setup lang="ts">
import {
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "reka-ui";
import { computed } from "vue";
import { useDisplayModel } from "./display-utils";
const props = withDefaults(
  defineProps<{
    label?: string;
    value?: string | null;
    modelValue?: string | null;
    defaultValue?: string | null;
    items: Array<{
      value?: string;
      label: string;
      links: Array<{
        label: string;
        href: string;
        description?: string;
        active?: boolean;
      }>;
    }>;
  }>(),
  { label: "Main navigation" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  "update:value": [value: string | null];
  "value-change": [value: string | null];
}>();
const selected = useDisplayModel(
  () => (props.modelValue !== undefined ? props.modelValue : props.value),
  props.defaultValue ?? null,
  (value) => {
    emit("update:modelValue", value);
    emit("update:value", value);
    emit("value-change", value);
  },
);
const model = computed({
  get: () => selected.value ?? "",
  set: (value: string) => {
    selected.value = value || null;
  },
});
</script>
<template>
  <NavigationMenuRoot v-model="model" class="cr-navigation" :aria-label="label"
    ><NavigationMenuList class="cr-navigation-list"
      ><NavigationMenuItem
        v-for="(item, index) in items"
        :key="item.value ?? index"
        :value="item.value ?? String(index)"
        ><NavigationMenuTrigger class="cr-button" data-variant="ghost"
          >{{ item.label }}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" /></svg></NavigationMenuTrigger
        ><NavigationMenuContent class="cr-navigation-content"
          ><NavigationMenuLink
            v-for="link in item.links"
            :key="link.href"
            :href="link.href"
            :active="link.active"
            class="cr-navigation-link"
            @select="selected = null"
            ><strong>{{ link.label }}</strong
            ><span v-if="link.description">{{
              link.description
            }}</span></NavigationMenuLink
          ></NavigationMenuContent
        ></NavigationMenuItem
      ></NavigationMenuList
    >
    <div class="cr-vue-navigation-positioner">
      <NavigationMenuViewport class="cr-popup" /></div
  ></NavigationMenuRoot>
</template>
