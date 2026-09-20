<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(
  defineProps<{
    page: number;
    totalPages: number;
    label?: string;
    disabled?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (page: number) => string;
  }>(),
  {
    label: "Pagination",
    disabled: false,
    previousLabel: "Previous",
    nextLabel: "Next",
    pageLabel: (page: number) => `Page ${page}`,
  },
);
const emit = defineEmits<{
  "update:page": [page: number];
  "page-change": [page: number];
}>();
const total = computed(() =>
  Number.isFinite(props.totalPages)
    ? Math.max(1, Math.floor(props.totalPages))
    : 1,
);
const current = computed(() =>
  Number.isFinite(props.page)
    ? Math.max(1, Math.min(total.value, Math.floor(props.page)))
    : 1,
);
const pages = computed(() =>
  Array.from(
    { length: Math.min(total.value, 5) },
    (_, index) =>
      Math.max(1, Math.min(current.value - 2, total.value - 4)) + index,
  ),
);
function change(page: number) {
  if (props.disabled) return;
  emit("update:page", page);
  emit("page-change", page);
}
</script>
<template>
  <nav :aria-label="label" class="cr-pagination">
    <button
      type="button"
      class="cr-button"
      data-variant="outline"
      data-size="sm"
      :aria-label="previousLabel"
      :disabled="disabled || current === 1"
      @click="change(current - 1)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg></button
    ><button
      v-for="number in pages"
      :key="number"
      type="button"
      class="cr-button"
      data-size="sm"
      :data-variant="number === current ? 'primary' : 'ghost'"
      :aria-current="number === current ? 'page' : undefined"
      :aria-label="pageLabel(number)"
      :disabled="disabled"
      @click="change(number)"
    >
      {{ number }}</button
    ><button
      type="button"
      class="cr-button"
      data-variant="outline"
      data-size="sm"
      :aria-label="nextLabel"
      :disabled="disabled || current === total"
      @click="change(current + 1)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  </nav>
</template>
