<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "reka-ui";
import { RenderContent, useDisplayModel } from "./display-utils";
import type { DisplayContent } from "./display-types";
const props = withDefaults(
  defineProps<{
    label: string;
    items: Array<{
      value: string;
      label: string;
      content?: DisplayContent;
      disabled?: boolean;
    }>;
    value?: string;
    modelValue?: string;
    defaultValue?: string;
    keepMounted?: boolean;
    activateOnFocus?: boolean;
    orientation?: "horizontal" | "vertical";
  }>(),
  { keepMounted: false, activateOnFocus: false, orientation: "horizontal" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:value": [value: string];
  "value-change": [value: string];
}>();
const selected = useDisplayModel(
  () => props.modelValue ?? props.value,
  props.defaultValue ?? props.items.find((item) => !item.disabled)?.value ?? "",
  (value) => {
    emit("update:modelValue", value);
    emit("update:value", value);
    emit("value-change", value);
  },
);
</script>
<template>
  <TabsRoot
    v-model="selected"
    :orientation="orientation"
    :activation-mode="activateOnFocus ? 'automatic' : 'manual'"
    class="cr-tabs"
    ><TabsList :aria-label="label" class="cr-tabs-list"
      ><TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="cr-tab"
        ><slot name="label" :item="item">{{ item.label }}</slot></TabsTrigger
      ></TabsList
    ><TabsContent
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :force-mount="keepMounted || undefined"
      v-show="!keepMounted || selected === item.value"
      class="cr-tab-panel"
      ><slot :name="item.value" :item="item"
        ><slot name="content" :item="item"
          ><RenderContent :content="item.content" /></slot></slot></TabsContent
  ></TabsRoot>
</template>
