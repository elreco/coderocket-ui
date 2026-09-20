# Vue Tailwind Datepicker

A date and date range picker for Vue 3, styled with Tailwind CSS.

> **Frozen and no longer maintained.** This source is preserved under MIT, with its original attribution. Existing npm versions remain available, but no new fixes, features or releases are planned. Active development has moved to [CodeRocket UI](https://ui.coderocket.app), initially for React; it is not a drop-in Vue replacement.

## Frozen package

The final package name is **`@coderocketapp/vue-tailwind-datepicker`**.
The previous `vue-tailwind-datepicker` package also remains available. Neither
package is maintained. Existing installations do not migrate automatically.

```sh
npm uninstall vue-tailwind-datepicker
npm install @coderocketapp/vue-tailwind-datepicker dayjs
```

For a new application, only the install command is needed. Vue 3 is required.
The package includes compiled CSS; an application does not need to configure
Tailwind or the forms plugin to display the picker.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import VueTailwindDatepicker from '@coderocketapp/vue-tailwind-datepicker'
import '@coderocketapp/vue-tailwind-datepicker/style.css'

const dateValue = ref('')
const formatter = { date: 'YYYY-MM-DD', month: 'MMM' }
</script>

<template>
  <VueTailwindDatepicker v-model="dateValue" :formatter="formatter" i18n="en" />
</template>
```

Import the stylesheet once in your application. To select one date, add `as-single`.
The component also supports arrays and objects as values, custom shortcuts,
disabled dates, translations, inline calendars and explicit Apply/Cancel buttons.

Use `color-mode="light"` or `color-mode="dark"` to force the appearance.
`color-mode="auto"` follows a dark ancestor or the system preference.

## Documentation

[Installation](docs/installation.md) · [Props](docs/props.md) ·
[Events](docs/events.md) · [Theming](docs/theming-options.md)

[Documentation website](https://vue-tailwind-datepicker.com) ·
[Historical releases](https://github.com/elreco/coderocket-ui/releases)

## Local development

Use Node.js 22.14+ (Node 24 is used in CI).

```sh
npm ci
npm run dev
```

The playground is available at the address printed by Vite.

```sh
npm run typecheck
npm run build
npm run check:package
npm run docs:install
npm run docs:dev
npm run docs:build
```

The archived [release guide](.github/RELEASE_GUIDE.md) and nested workflows are historical records. Automatic publication is disabled; no new datepicker releases are planned.

## License and credits

[MIT](LICENSE). Based on the original work by [Kenhyuwa](https://github.com/kenhyuwa),
with contributions from the Vue Tailwind Datepicker community.
