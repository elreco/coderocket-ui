<script setup lang="ts">
import { computed, ref } from "vue";
import CompositionNode from "./components/composition-node.vue";
import type {
  Composition,
  CompositionAction,
} from "./components/composition-types";
const props = defineProps<{
  composition: Composition;
  onAction?: CompositionAction;
}>();
const notice = ref("");
const busy = ref(false);
const root = computed(() =>
  props.composition.nodes.find((node) => node.parent === null),
);
async function act(
  action: string,
  values?: Record<string, FormDataEntryValue>,
) {
  if (busy.value) return;
  busy.value = true;
  notice.value = "";
  try {
    if (props.onAction) await props.onAction(action, values);
    else
      notice.value = `Preview action: ${action}. Connect your application's handler after export.`;
  } catch {
    notice.value = "The action could not be completed. Please try again.";
  } finally {
    busy.value = false;
  }
}
defineExpose({ busy, notice });
</script>
<template>
  <div class="cr-stack" :aria-busy="busy || undefined">
    <CompositionNode
      v-if="root"
      :composition="composition"
      :node="root"
      :busy="busy"
      :act="act"
    />
    <p role="status" class="cr-description">{{ busy ? "Working…" : notice }}</p>
  </div>
</template>
