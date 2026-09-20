# Installation

## Frozen package {#maintained-package}

**This package is no longer maintained.** The existing release remains available as
**`@coderocketapp/vue-tailwind-datepicker`**. No new fixes, features or releases are
planned. The old `vue-tailwind-datepicker` name also remains available.

If you used the old package, remove it first:

```sh
npm uninstall vue-tailwind-datepicker
```

Install the frozen package in your Vue 3 application:

```sh
npm install @coderocketapp/vue-tailwind-datepicker dayjs
```

Or with Yarn:

```sh
yarn add @coderocketapp/vue-tailwind-datepicker dayjs
```

## Import the stylesheet

Import the compiled stylesheet once, for example in `main.ts`:

```ts
import '@coderocketapp/vue-tailwind-datepicker/style.css'
```

The stylesheet is included in the package. You do not need a Tailwind build,
content configuration or `@tailwindcss/forms` in the consuming application.
See [Theming](./theming-options.md) to customize the colors.

## Use a component

```vue
<script setup>
import { ref } from 'vue'
import VueTailwindDatepicker from '@coderocketapp/vue-tailwind-datepicker'

const dateValue = ref('')
const formatter = { date: 'YYYY-MM-DD', month: 'MMM' }
</script>

<template>
  <VueTailwindDatepicker v-model="dateValue" :formatter="formatter" />
</template>
```

Add `as-single` for a single date. For a date range returned as an array, initialize
`dateValue` with `ref([])` instead. During migration, update package import paths,
including the CSS import; component names and props are unchanged.

## Global registration

```ts
import { createApp } from 'vue'
import App from './App.vue'
import VueTailwindDatepicker from '@coderocketapp/vue-tailwind-datepicker'
import '@coderocketapp/vue-tailwind-datepicker/style.css'

createApp(App).use(VueTailwindDatepicker).mount('#app')
```

## Nuxt

Add the stylesheet to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  css: ['@coderocketapp/vue-tailwind-datepicker/style.css'],
})
```

Import the component in the page or component where it is used:

```vue
<script setup>
import { ref } from 'vue'
import VueTailwindDatepicker from '@coderocketapp/vue-tailwind-datepicker'

const dateValue = ref('')
</script>

<template>
  <VueTailwindDatepicker v-model="dateValue" />
</template>
```
