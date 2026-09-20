<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ComboboxRoot,
  ComboboxInput,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxEmpty,
} from "reka-ui";
import Dialog from "./dialog.vue";
import { RenderContent, useDisplayModel } from "./display-utils";
import type { CommandItem, DisplayContent } from "./display-types";
const props = withDefaults(
  defineProps<{
    trigger?: DisplayContent;
    title?: string;
    items: CommandItem[];
    open?: boolean;
    defaultOpen?: boolean;
    searchLabel?: string;
    searchPlaceholder?: string;
    emptyMessage?: DisplayContent;
  }>(),
  {
    trigger: "Open commands",
    title: "Command menu",
    open: undefined,
    defaultOpen: false,
    searchLabel: "Search commands",
    searchPlaceholder: "Search commands…",
    emptyMessage: "No matching commands.",
  },
);
const emit = defineEmits<{
  "update:open": [value: boolean];
  "open-change": [value: boolean];
  select: [item: CommandItem];
}>();
const expanded = useDisplayModel(
  () => props.open,
  props.defaultOpen,
  (value) => {
    emit("update:open", value);
    emit("open-change", value);
    if (!value) search.value = "";
  },
);
const search = ref("");
const input = ref<InstanceType<typeof ComboboxInput>>();
const filtered = computed(() =>
  props.items.filter((item) =>
    `${item.label} ${item.description ?? ""}`
      .toLocaleLowerCase()
      .includes(search.value.toLocaleLowerCase()),
  ),
);
function select(value: unknown) {
  const item = props.items.find((item) => item.value === value);
  if (!item || item.disabled) return;
  item.onSelect?.();
  emit("select", item);
  expanded.value = false;
}
</script>
<template>
  <Dialog
    v-model:open="expanded"
    :trigger="trigger"
    :title="title"
    :initial-focus="() => input?.$el as HTMLInputElement"
    ><template v-if="$slots.trigger" #trigger><slot name="trigger" /></template
    ><ComboboxRoot
      :open="true"
      :model-value="null"
      :reset-search-term-on-blur="false"
      :reset-search-term-on-select="false"
      ignore-filter
      @update:model-value="select"
      ><ComboboxInput
        ref="input"
        v-model="search"
        :aria-label="searchLabel"
        :placeholder="searchPlaceholder"
        class="cr-input"
      /><ComboboxContent
        :disable-outside-pointer-events="false"
        class="cr-command-list"
        ><ComboboxViewport
          ><ComboboxEmpty v-if="!filtered.length" class="cr-description"
            ><slot name="empty"
              ><RenderContent :content="emptyMessage" /></slot></ComboboxEmpty
          ><ComboboxItem
            v-for="item in filtered"
            :key="item.value"
            :value="item.value"
            :disabled="item.disabled"
            class="cr-menu-item"
            ><span class="cr-command-item-text"
              ><span>{{ item.label }}</span
              ><small v-if="item.description" class="cr-description">{{
                item.description
              }}</small></span
            ></ComboboxItem
          ></ComboboxViewport
        ></ComboboxContent
      ></ComboboxRoot
    ></Dialog
  >
</template>
