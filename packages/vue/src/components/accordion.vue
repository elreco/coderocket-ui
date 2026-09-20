<script setup lang="ts">
import { computed } from "vue";
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from "reka-ui";
import { RenderContent, useDisplayModel } from "./display-utils";
import type { DisplayContent } from "./display-types";
const props = withDefaults(
  defineProps<{
    items: Array<{
      value: string;
      title: string;
      content?: DisplayContent;
      disabled?: boolean;
    }>;
    multiple?: boolean;
    value?: string[];
    modelValue?: string[];
    defaultValue?: string[];
    disabled?: boolean;
    keepMounted?: boolean;
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    multiple: false,
    disabled: false,
    keepMounted: false,
    orientation: "vertical",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  "update:value": [value: string[]];
  "value-change": [value: string[]];
}>();
const selected = useDisplayModel(
  () => props.modelValue ?? props.value,
  props.defaultValue ?? [],
  (value) => {
    emit("update:modelValue", value);
    emit("update:value", value);
    emit("value-change", value);
  },
);
const primitiveValue = computed(() =>
  props.multiple ? selected.value : (selected.value[0] ?? ""),
);
function update(value: string | string[] | undefined) {
  selected.value = Array.isArray(value) ? value : value ? [value] : [];
}
</script>
<template>
  <AccordionRoot
    :type="multiple ? 'multiple' : 'single'"
    :model-value="primitiveValue"
    :disabled="disabled"
    :orientation="orientation"
    collapsible
    class="cr-accordion"
    @update:model-value="update"
    ><AccordionItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      class="cr-accordion-item"
      ><AccordionHeader
        ><AccordionTrigger class="cr-accordion-trigger"
          ><slot name="title" :item="item">{{ item.title }}</slot
          ><span aria-hidden="true"
            ><svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                d="M12 5v14M5 12h14"
              /></svg></span></AccordionTrigger></AccordionHeader
      ><AccordionContent
        :force-mount="keepMounted || undefined"
        v-show="!keepMounted || selected.includes(item.value)"
        class="cr-accordion-panel"
        ><slot :name="item.value" :item="item"
          ><slot name="content" :item="item"
            ><RenderContent
              :content="
                item.content
              " /></slot></slot></AccordionContent></AccordionItem
  ></AccordionRoot>
</template>
