<script setup lang="ts">
import type { DisplayContent } from "../components/display-types";
import { RenderContent } from "../components/display-utils";
defineProps<{
  brand: string;
  description: string;
  groups: readonly {
    title: string;
    links: readonly { label: string; href: string }[];
  }[];
  copyright: string;
  logo?: DisplayContent;
  brandHref?: string;
  legalLinks?: readonly { label: string; href: string }[];
}>();
</script>
<template>
  <footer class="cr-footer">
    <div class="cr-footer-main">
      <div class="cr-footer-brand">
        <component
          :is="brandHref ? 'a' : 'div'"
          class="cr-footer-identity"
          :href="brandHref"
          ><span
            v-if="logo || $slots.logo"
            class="cr-footer-logo"
            aria-hidden="true"
            ><slot name="logo"><RenderContent :content="logo" /></slot></span
          ><strong>{{ brand }}</strong></component
        >
        <p class="cr-description">{{ description }}</p>
      </div>
      <div class="cr-footer-navigation">
        <nav
          v-for="group in groups"
          :key="group.title"
          :aria-label="group.title"
        >
          <strong>{{ group.title }}</strong
          ><a v-for="link in group.links" :key="link.href" :href="link.href">{{
            link.label
          }}</a>
        </nav>
      </div>
    </div>
    <div class="cr-footer-bottom">
      <p class="cr-description">{{ copyright }}</p>
      <nav v-if="legalLinks?.length" aria-label="Legal">
        <a v-for="link in legalLinks" :key="link.href" :href="link.href">{{
          link.label
        }}</a>
      </nav>
    </div>
  </footer>
</template>
