# CodeRocket React

48 experimental React components, built on Base UI with compiled CSS. MIT licensed. React 19.3 is the supported source-release version; Tailwind is optional.

Build from the repository root with `pnpm build`, then use the workspace package. The package name does not imply a public npm release:

```tsx
import { Button, ThemeScope } from "@coderocket/react";
import "@coderocket/react/styles.css";

export function App() {
  return (
    <ThemeScope>
      <Button>Continue</Button>
    </ThemeScope>
  );
}
```

Use `ThemeScope` so typography, focus and portalled controls share CSS variables. Provide labels, connect callbacks to your own application logic, and test in your product before shipping.

The `composition` entry renders validated compositions of known primitives; it does not execute arbitrary model-generated JavaScript. The `showcase` entry provides examples.

[Component documentation](https://ui.coderocket.app/docs/components) · [Development guide](../../docs/DEVELOPMENT.md)

For native Vue components with the same tokens and catalogue, see [`@coderocket/vue`](../vue). Framework-specific props and behavior should be read in their own documentation.
