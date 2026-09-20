<script setup lang="ts">
import { useId } from "vue";
import { RenderContent, useDisplayModel } from "./display-utils";
import type { DisplayContent } from "./display-types";
const props = withDefaults(
  defineProps<{
    brand?: DisplayContent;
    items: Array<{
      label: string;
      href: string;
      icon?: DisplayContent;
      active?: boolean;
    }>;
    footer?: DisplayContent;
    label?: string;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
  }>(),
  {
    label: "Workspace navigation",
    collapsed: undefined,
    defaultCollapsed: false,
  },
);
const emit = defineEmits<{
  "update:collapsed": [value: boolean];
  "collapsed-change": [value: boolean];
}>();
const isCollapsed = useDisplayModel(
  () => props.collapsed,
  props.defaultCollapsed,
  (value) => {
    emit("update:collapsed", value);
    emit("collapsed-change", value);
  },
);
const navigationId = useId();
</script>
<template>
  <aside class="cr-sidebar" :data-collapsed="isCollapsed">
    <div class="cr-sidebar-header">
      <template v-if="!isCollapsed"
        ><slot name="brand"><RenderContent :content="brand" /></slot></template
      ><button
        type="button"
        class="cr-button cr-sidebar-toggle"
        data-variant="ghost"
        data-size="sm"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!isCollapsed"
        :aria-controls="navigationId"
        @click="isCollapsed = !isCollapsed"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path
            :d="isCollapsed ? 'M9 3v18m4-12 3 3-3 3' : 'M9 3v18m7-12-3 3 3 3'"
          />
        </svg>
      </button>
    </div>
    <nav :id="navigationId" :aria-label="label">
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :aria-label="isCollapsed ? item.label : undefined"
        :aria-current="item.active ? 'page' : undefined"
        :title="isCollapsed ? item.label : undefined"
        ><span class="cr-sidebar-icon" aria-hidden="true"
          ><slot name="icon" :item="item"
            ><RenderContent v-if="item.icon" :content="item.icon" /><svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke-dasharray="3 3"
              /></svg></slot></span
        ><template v-if="!isCollapsed">{{ item.label }}</template></a
      >
    </nav>
    <footer v-if="!isCollapsed && (footer || $slots.footer)">
      <slot name="footer"><RenderContent :content="footer" /></slot>
    </footer>
  </aside>
</template>
