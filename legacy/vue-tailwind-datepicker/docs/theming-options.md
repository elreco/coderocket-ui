# Theming options

Import the package stylesheet before your application overrides:

```ts
import '@coderocketapp/vue-tailwind-datepicker/style.css'
import './app.css'
```

## Colors

The compiled stylesheet uses CSS variables for its two color palettes:
`--color-vtd-primary-*` and `--color-vtd-secondary-*` (shades 50 through 950).
Override them globally or on a wrapper around one picker. For example:

```css
.my-datepicker {
  --color-vtd-primary-100: #dbeafe;
  --color-vtd-primary-500: #3b82f6;
  --color-vtd-primary-600: #2563eb;
  --color-vtd-primary-700: #1d4ed8;
}
```

```vue
<div class="my-datepicker">
  <VueTailwindDatepicker v-model="dateValue" />
</div>
```

Override the remaining shades when you need to replace the entire palette.
Tailwind's `content` configuration is not needed for the prebuilt stylesheet.

## Light and dark mode

- `color-mode="light"` forces a light picker.
- `color-mode="dark"` forces a dark picker.
- `color-mode="auto"` (default) uses a dark appearance if an ancestor has a
  `.dark` class or the operating system prefers dark mode.

Use an explicit mode when your application has its own light/dark preference.
See [Props > Color mode](./props.md#color-mode) for examples.
