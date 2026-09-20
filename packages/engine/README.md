# CodeRocket design-system engine

MIT-licensed data and validation for CodeRocket UI. The current renderer and valid model framework are React.

```ts
import {
  createDesignSystem,
  designSystemSchema,
  generateCSS,
} from "@coderocket/engine";

const system = createDesignSystem("My product", "light");
designSystemSchema.parse(system);
const stylesheet = generateCSS(system);
```

Includes token variables, recipes, patch operations, model diffs and contrast checks. The `import` entry turns bounded local import reports into proposals to review. No hosted account, database or AI provider is required. A contrast report does not certify accessibility of an entire rendered app.
