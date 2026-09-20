<script setup lang="ts">
import { computed } from "vue";
import type {
  Composition,
  CompositionNode,
  CompositionAction,
} from "./composition-types";
import Button from "./button.vue";
import Card from "./card.vue";
import Input from "./input.vue";
import Textarea from "./textarea.vue";
import Field from "./field.vue";
import Checkbox from "./checkbox.vue";
import Switch from "./switch.vue";
import Select from "./select.vue";
import Badge from "./badge.vue";
import Progress from "./progress.vue";
import Avatar from "./avatar.vue";
import Separator from "./separator.vue";
import FileSelection from "./file-selection.vue";
const props = defineProps<{
  composition: Composition;
  node: CompositionNode;
  busy: boolean;
  act: CompositionAction;
  depth?: number;
}>();
const children = computed(() =>
  (props.depth ?? 0) >= 10
    ? []
    : props.composition.nodes.filter((item) => item.parent === props.node.id),
);
const buttonVariant = computed(() =>
  ["primary", "secondary", "outline", "ghost", "destructive"].includes(
    props.node.variant ?? "",
  )
    ? (props.node.variant as
        "primary" | "secondary" | "outline" | "ghost" | "destructive")
    : "primary",
);
const badgeVariant = computed(() =>
  ["secondary", "outline", "destructive", "success", "warning"].includes(
    props.node.variant ?? "",
  )
    ? (props.node.variant as
        "secondary" | "outline" | "destructive" | "success" | "warning")
    : "secondary",
);
function submit(event: Event) {
  event.preventDefault();
  void props.act(
    props.node.action ?? props.node.id,
    Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)),
  );
}
function files(next: File[]) {
  void props.act(
    props.node.action || props.node.name || props.node.id,
    Object.fromEntries(next.map((file, index) => [String(index), file])),
  );
}
</script>
<template>
  <component
    v-if="['stack', 'row', 'grid', 'card', 'form'].includes(node.kind)"
    :is="node.kind === 'card' ? Card : node.kind === 'form' ? 'form' : 'div'"
    :class="
      node.kind === 'row'
        ? 'cr-row'
        : node.kind === 'stack' || node.kind === 'form'
          ? 'cr-stack'
          : undefined
    "
    :style="
      node.kind === 'grid'
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
            gap: 'calc(var(--cr-space)*4)',
          }
        : undefined
    "
    :title="node.kind === 'card' ? node.text || undefined : undefined"
    :description="
      node.kind === 'card' ? node.description || undefined : undefined
    "
    :aria-label="
      node.kind === 'form' ? node.text || composition.name : undefined
    "
    v-on="node.kind === 'form' ? { submit } : {}"
    ><div v-for="child in children" :key="child.id">
      <CompositionNode
        :composition="composition"
        :node="child"
        :busy="busy"
        :act="act"
        :depth="(depth ?? 0) + 1"
      /></div
  ></component>
  <h2 v-else-if="node.kind === 'heading'">{{ node.text }}</h2>
  <p v-else-if="node.kind === 'text'" class="cr-description">{{ node.text }}</p>
  <Button
    v-else-if="node.kind === 'button'"
    :disabled="busy"
    :variant="buttonVariant"
    :type="node.action === 'submit' ? 'submit' : 'button'"
    @click="node.action !== 'submit' && act(node.action ?? node.id)"
    >{{ node.text }}</Button
  >
  <Badge v-else-if="node.kind === 'badge'" :variant="badgeVariant">{{
    node.text
  }}</Badge>
  <Separator v-else-if="node.kind === 'separator'" />
  <Field
    v-else-if="
      node.kind === 'input' ||
      node.kind === 'textarea' ||
      node.kind === 'select'
    "
    :label="node.text"
    :description="node.description"
    ><Input
      v-if="node.kind === 'input'"
      :name="node.name"
      :required="node.required"
      :type="node.inputType || 'text'" /><Textarea
      v-else-if="node.kind === 'textarea'"
      :name="node.name"
      :required="node.required" /><Select
      v-else
      :name="node.name"
      :required="node.required"
      :label="node.text"
      :options="node.options ?? []"
  /></Field>
  <Checkbox
    v-else-if="node.kind === 'checkbox'"
    :name="node.name"
    :required="node.required"
    :label="node.text"
  />
  <Switch
    v-else-if="node.kind === 'switch'"
    :name="node.name"
    :required="node.required"
    :label="node.text"
  />
  <Progress
    v-else-if="node.kind === 'progress'"
    :label="node.text"
    :value="node.value ?? 0"
  />
  <Avatar v-else-if="node.kind === 'avatar'" :name="node.text" />
  <FileSelection
    v-else-if="node.kind === 'file-upload'"
    :label="node.text"
    :name="node.name ?? node.id"
    :required="node.required"
    :disabled="busy"
    @files="files"
  />
</template>
