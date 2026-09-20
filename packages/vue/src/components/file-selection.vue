<script setup lang="ts">
import { ref, useId } from "vue";
import { useFormReset } from "./utils";
defineProps<{
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{ files: [files: File[]] }>();
const input = ref<HTMLInputElement>();
const id = useId();
const files = ref<File[]>([]);
function choose(next: File[]) {
  files.value = next;
  emit("files", next);
}
function drop(event: DragEvent) {
  if (input.value?.disabled) return;
  const dropped = Array.from(event.dataTransfer?.files ?? []);
  if (input.value) {
    const transfer = new DataTransfer();
    dropped.forEach((file) => transfer.items.add(file));
    input.value.files = transfer.files;
  }
  choose(dropped);
}
useFormReset(input, () => {
  files.value = [];
});
</script>
<template>
  <div
    class="cr-stack"
    style="
      border: var(--cr-border-width) dashed var(--cr-border);
      border-radius: var(--cr-radius-md);
      padding: calc(var(--cr-space) * 4);
    "
    @dragover.prevent
    @drop.prevent="drop"
  >
    <label :for="id" class="cr-field"
      ><span class="cr-label">{{ label }}</span
      ><input
        ref="input"
        :id="id"
        type="file"
        :name="name"
        :required="required"
        :disabled="disabled"
        multiple
        @change="
          choose(Array.from(($event.target as HTMLInputElement).files ?? []))
        "
    /></label>
    <p class="cr-description">Drop files here or use the file chooser.</p>
    <ul aria-live="polite">
      <li v-for="(file, index) in files" :key="index">
        {{ file.name }} · {{ Math.ceil(file.size / 1024) }} KB
      </li>
    </ul>
  </div>
</template>
