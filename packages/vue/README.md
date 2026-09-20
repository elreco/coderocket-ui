# CodeRocket Vue

**48 Vue components and 26 interface blocks**, built with native Vue single-file components and Reka UI. MIT licensed, TypeScript typed and Tailwind optional. This source release uses Vue 3.5.43 and Reka UI 2.10.4.

## Use the source workspace

Run `pnpm install --frozen-lockfile` and `pnpm build` from the repository root. Add `@coderocket/vue` as a `workspace:*` dependency in a Vue consumer inside the workspace. These instructions do not imply a published npm package.

```vue
<script setup lang="ts">
import { Button, ThemeScope } from "@coderocket/vue";
import "@coderocket/vue/styles.css";
</script>

<template>
  <ThemeScope><Button>Continue</Button></ThemeScope>
</template>
```

The stylesheet includes component and block styles. Import blocks from `@coderocket/vue/blocks`. Use `ThemeScope` so typography, focus and portalled controls share the same variables. Apply your generated theme after the library stylesheet.

## Native Vue APIs

Components use slots, emitted events and `v-model`; read each component's props and source. They share the React catalogue, tokens, layouts and core behavior, but framework-specific APIs are not identical. They do not wrap React or load a React runtime.

The `composition` entry renders validated trees of known components, rather than executing arbitrary AI-generated JavaScript. Blocks provide application callbacks; authentication, uploads, billing and storage need your own backend.

The catalogue is experimental. Provide accessible labels and test keyboard behavior, mobile layout and SSR in your application before release. The new DatePicker is not a drop-in replacement for the frozen Vue Tailwind Datepicker API.

[Vue documentation](https://ui.coderocket.app/docs/vue) · [Components](https://ui.coderocket.app/docs/vue/components) · [Blocks](https://ui.coderocket.app/docs/vue/blocks) · [Development guide](../../docs/DEVELOPMENT.md)
