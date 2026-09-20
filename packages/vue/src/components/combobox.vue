<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxContent,
  ComboboxViewport,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxItemIndicator,
} from "reka-ui";
import {
  cx,
  useControllable,
  useFieldControl,
  useFormReset,
  usePortalContainer,
} from "./utils";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label: string;
    items: readonly string[];
    filteredItems?: readonly string[];
    value?: string | null;
    defaultValue?: string | null;
    defaultOpen?: boolean;
    inputValue?: string;
    defaultInputValue?: string;
    placeholder?: string;
    className?: string;
    inputProps?: Record<string, unknown>;
    isItemDisabled?: (item: string) => boolean;
    emptyLabel?: string;
    clearable?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    form?: string;
    id?: string;
    dir?: "ltr" | "rtl";
    openOnInputClick?: boolean;
  }>(),
  {
    placeholder: "Search…",
    emptyLabel: "No results found.",
    openOnInputClick: true,
  },
);
const model = defineModel<string | null>();
const openModel = defineModel<boolean | undefined>("open", {
  default: undefined,
});
const searchModel = defineModel<string>("searchTerm");
const emit = defineEmits<{
  "value-change": [value: string | null];
  "open-change": [open: boolean];
  "input-value-change": [value: string];
}>();
const { field, fieldAttrs } = useFieldControl(() => props.id);
const disabled = computed(() => props.disabled || field?.disabled.value);
const value = useControllable(
  model,
  () => props.value,
  () => props.defaultValue ?? null,
  (next) => emit("value-change", next),
);
const open = useControllable(
  openModel,
  () => undefined,
  () => props.defaultOpen ?? false,
  (next) => emit("open-change", next),
);
const search = useControllable(
  searchModel,
  () => props.inputValue,
  () => props.defaultInputValue ?? "",
  (next) => emit("input-value-change", next),
);
const popupOpen = computed({
  get: () => (props.readOnly ? false : open.value),
  set: (next: boolean) => {
    if (!props.readOnly) open.value = next;
  },
});
const portalContainer = usePortalContainer();
const native = ref<HTMLInputElement>();
const input = ref<{ $el: HTMLInputElement }>();
function update(next: unknown) {
  if (props.readOnly || disabled.value) return;
  value.value = next == null ? null : String(next);
  field?.notifyChange();
}
function clear() {
  if (props.readOnly || disabled.value) return;
  value.value = null;
  search.value = "";
  input.value?.$el?.focus();
  field?.notifyChange();
}
useFormReset(
  native,
  () => {
    value.value = props.defaultValue ?? null;
    search.value = props.defaultInputValue ?? "";
    open.value = false;
  },
  () => props.form,
);
</script>
<template>
  <ComboboxRoot
    v-bind="$attrs"
    :model-value="value ?? undefined"
    v-model:open="popupOpen"
    :disabled="disabled"
    :dir="dir"
    :ignore-filter="filteredItems !== undefined"
    :open-on-click="openOnInputClick"
    :reset-model-value-on-clear="true"
    @update:model-value="update"
    ><ComboboxAnchor :class="cx('cr-input-group', className)"
      ><ComboboxInput
        ref="input"
        v-model="search"
        v-bind="{ ...fieldAttrs, ...inputProps, name: undefined }"
        :aria-label="label"
        :placeholder="placeholder"
        :readonly="readOnly"
        :required="required"
        :disabled="disabled"
        class="cr-input" /><button
        v-if="clearable"
        type="button"
        :aria-label="'Clear ' + label"
        :disabled="disabled || readOnly"
        class="cr-input-addon"
        @click="clear"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg></button
      ><ComboboxTrigger
        :aria-label="'Open ' + label"
        :disabled="disabled || readOnly"
        class="cr-input-addon"
        ><svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" /></svg></ComboboxTrigger></ComboboxAnchor
    ><ComboboxPortal :to="portalContainer"
      ><ComboboxContent
        class="cr-popup cr-positioner"
        position="popper"
        :side-offset="6"
        align="start"
        ><ComboboxViewport
          ><ComboboxEmpty class="cr-menu-item">{{ emptyLabel }}</ComboboxEmpty
          ><ComboboxItem
            v-for="item in filteredItems ?? items"
            :key="item"
            :value="item"
            :disabled="isItemDisabled?.(item)"
            class="cr-menu-item"
            >{{ item
            }}<ComboboxItemIndicator
              ><svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="m20 6-11 11-5-5"
                /></svg></ComboboxItemIndicator></ComboboxItem></ComboboxViewport></ComboboxContent></ComboboxPortal
    ><input
      ref="native"
      class="cr-sr-only"
      aria-hidden="true"
      tabindex="-1"
      :name="name ?? fieldAttrs.name"
      :form="form"
      :required="required"
      :disabled="disabled"
      :value="value ?? ''"
      @input="value = ($event.target as HTMLInputElement).value"
  /></ComboboxRoot>
</template>
