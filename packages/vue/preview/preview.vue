<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Box } from "@lucide/vue";
import {
  generateCSS,
  tokenVariables,
  type DesignSystem,
} from "@coderocket/engine";
import type { Composition } from "@coderocket/specs/composition";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DataTable,
  Dialog,
  Field,
  Input,
  NumberField,
  Select,
  Switch,
  ThemeScope,
} from "../src/index";
import CompositionPreview from "../src/composition.vue";
import BlockShowcase from "./block-showcase.vue";
import Showcase from "./showcase.vue";

const props = withDefaults(
  defineProps<{
    system: DesignSystem;
    kind?: "component" | "block" | "application" | "composition";
    slug?: string;
    composition?: Composition;
  }>(),
  { kind: "component", slug: "button" },
);
const scope = `cr-vue-preview-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
const css = computed(() => generateCSS(props.system, `.${scope}`));
const tokens = computed(() => ({
  ...tokenVariables(props.system),
  colorScheme: props.system.mode,
}));
const saved = ref(false);
const color = ref<string | string[] | null>("Graphite");
const quantity = ref<number | null>(1);
const cart = ref(0);
const applicationBlocks = computed(() =>
  props.slug === "settings"
    ? ["settings", "team"]
    : props.slug === "authentication"
      ? ["login"]
      : ["hero", "features", "faq"],
);
function addToCart() {
  cart.value += Math.max(1, Math.min(9, quantity.value ?? 1));
}
</script>

<template>
  <ThemeScope :class-name="scope" :style="tokens" data-cr-framework="vue">
    <component :is="'style'">{{ css }}</component>
    <CompositionPreview
      v-if="kind === 'composition' && composition"
      :composition="composition"
    />
    <BlockShowcase v-else-if="kind === 'block'" :key="slug" :slug="slug" />
    <div v-else-if="kind === 'component'" class="single-component-preview">
      <Showcase :key="slug" :slug="slug" />
    </div>
    <div
      v-else-if="kind === 'application' && slug === 'e-commerce'"
      class="cr-stack"
    >
      <p class="cr-description">SAMPLE SHOP · PREVIEW CART ONLY</p>
      <div class="application-cards">
        <div class="cr-vue-product-visual">
          <Box :size="80" :stroke-width="1" aria-hidden="true" />
        </div>
        <Card
          title="Everyday carry"
          description="A sample product for exploring your storefront design."
        >
          <div class="cr-stack">
            <strong style="font-size: 1.5em">€79.00</strong>
            <Field label="Color"
              ><Select
                v-model="color"
                label="Color"
                :options="[
                  { label: 'Graphite', value: 'Graphite' },
                  { label: 'Sand', value: 'Sand' },
                ]"
            /></Field>
            <NumberField
              v-model="quantity"
              label="Quantity"
              :min="1"
              :max="9"
            />
            <Button @click="addToCart">Add to preview cart</Button>
            <p role="status" class="cr-description">
              {{
                cart
                  ? `${cart} items in your preview cart · €${(cart * 79).toFixed(2)}`
                  : "Your preview cart is empty."
              }}
            </p>
            <Button v-if="cart" variant="outline" @click="cart = 0"
              >Clear preview cart</Button
            >
          </div>
        </Card>
      </div>
    </div>
    <div
      v-else-if="
        kind === 'application' && !['dashboard', 'foundation'].includes(slug)
      "
      class="cr-stack"
    >
      <p class="cr-description">INTERACTIVE EXAMPLE · SAMPLE DATA</p>
      <BlockShowcase
        v-for="block in applicationBlocks"
        :key="block"
        :slug="block"
      />
    </div>
    <div v-else-if="kind === 'application'" class="application-preview">
      <header>
        <div>
          <span class="cr-description">ACME WORKSPACE · SAMPLE DATA</span>
          <h2>
            {{
              slug === "foundation"
                ? "Make every detail yours."
                : "Good morning, Alex."
            }}
          </h2>
          <p class="cr-description">Your design system, in a real interface.</p>
        </div>
        <Avatar name="Alex Morgan" />
      </header>
      <div class="application-cards">
        <Card
          title="Workspace settings"
          description="The place for your next big idea."
        >
          <form
            class="cr-stack"
            @submit.prevent="saved = true"
            @reset="saved = false"
          >
            <Field label="Workspace name"
              ><Input
                required
                name="workspace"
                placeholder="Acme workspace"
                default-value="Acme"
                @value-change="saved = false"
            /></Field>
            <Field label="Default view"
              ><Select
                label="Default view"
                default-value="overview"
                :options="[
                  { value: 'overview', label: 'Overview' },
                  { value: 'projects', label: 'Projects' },
                ]"
            /></Field>
            <Switch label="Weekly activity digest" default-checked />
            <div class="cr-row">
              <Button type="submit">Save changes</Button
              ><Button type="reset" variant="outline">Reset</Button>
            </div>
            <p v-if="saved" role="status" class="cr-description">
              Preview settings saved.
            </p>
          </form>
        </Card>
        <div class="cr-stack">
          <Card
            title="Everything in its place."
            description="A consistent look, from buttons to tables."
          >
            <div class="cr-row">
              <Badge variant="success">Active</Badge><Badge>Vue</Badge
              ><Badge variant="outline">Your design</Badge>
            </div>
          </Card>
          <Card title="Project activity">
            <p class="cr-description">
              Explore spacing, colors and type in context. Every component
              follows the same foundation.
            </p>
            <div class="cr-row" style="margin-top: 20px">
              <Dialog
                trigger="View details"
                title="Sample project activity"
                description="An example of your theme inside an overlay."
                ><p class="cr-description">
                  Alex updated the customer portal. Sam reviewed the marketing
                  website.
                </p></Dialog
              ><Avatar name="Sam Taylor" :size="28" />
            </div>
          </Card>
        </div>
      </div>
      <DataTable
        v-if="slug !== 'foundation'"
        caption="Sample projects"
        :columns="[
          { key: 'name', label: 'Project' },
          { key: 'status', label: 'Status' },
          { key: 'owner', label: 'Owner' },
        ]"
        :rows="[
          { name: 'Customer portal', status: 'In progress', owner: 'Alex' },
          { name: 'Marketing website', status: 'Review', owner: 'Sam' },
          { name: 'Mobile app', status: 'Planning', owner: 'Jamie' },
        ]"
      />
    </div>
    <p v-else class="cr-description">Choose a preview to get started.</p>
  </ThemeScope>
</template>

<style scoped>
/* Documentation already centers the shared showcase wrapper. The Studio keeps
   its larger canvas, while both frameworks use the same document preview size. */
:global(.docs-preview [data-cr-framework="vue"] .single-component-preview) {
  min-height: 0;
  padding: 0;
}
.application-preview {
  display: grid;
  gap: 24px;
}
.application-preview > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.application-preview h2 {
  margin: 8px 0;
}
.application-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.cr-vue-product-visual {
  min-height: 220px;
  display: grid;
  place-items: center;
  background: var(--cr-muted);
  border-radius: var(--cr-radius-lg);
  border: 1px solid var(--cr-border);
}
@container (max-width: 560px) {
  .application-cards {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .application-cards {
    grid-template-columns: 1fr;
  }
}
</style>
