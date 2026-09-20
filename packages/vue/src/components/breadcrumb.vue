<script setup lang="ts">
withDefaults(
  defineProps<{
    items: Array<{ label: string; href?: string }>;
    label?: string;
  }>(),
  { label: "Breadcrumb" },
);
</script>
<template>
  <nav :aria-label="label">
    <ol class="cr-breadcrumb">
      <li v-for="(item, index) in items" :key="index">
        <svg
          v-if="index"
          class="cr-breadcrumb-separator"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" /></svg
        ><a v-if="item.href && index < items.length - 1" :href="item.href"
          ><slot name="item" :item="item" :index="index">{{
            item.label
          }}</slot></a
        ><span
          v-else
          :aria-current="index === items.length - 1 ? 'page' : undefined"
          ><slot name="item" :item="item" :index="index">{{
            item.label
          }}</slot></span
        >
      </li>
    </ol>
  </nav>
</template>
