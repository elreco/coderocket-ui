# Develop and use the open-source core

## Build and test

Use Node.js 24+ and pnpm 12.4.2:

```sh
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` verifies the public source manifest, typechecks both frameworks, builds the packages, runs tests and smoke-tests the distribution. You can run `pnpm typecheck`, `pnpm build`, `pnpm test` and `pnpm smoke` individually while developing. After an intentional source or documentation change, refresh the manifest with `node tooling/check-source-manifest.mjs --write` before the full check.

The build emits ES modules, TypeScript declarations and CSS. React entries retain the client boundary for frameworks such as Next.js. Vue single-file components are compiled for consumers. Runtime dependencies remain external. Tests cover date values, model validation, composition, framework behavior and the CLI's filesystem protection.

These are source workspaces, not an announcement of npm availability. Add a consumer inside this pnpm workspace with `workspace:*` dependencies, or build and package the required dependencies locally. The hosted Studio also exports standalone source you can copy into an existing application.

## A local React consumer

Add a consumer directory to `pnpm-workspace.yaml` and give it these dependencies:

```json
{
  "dependencies": {
    "@coderocket/react": "workspace:*",
    "@coderocket/blocks": "workspace:*",
    "@coderocket/engine": "workspace:*",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  }
}
```

Build the core first, then start your consumer's React bundler. Import `@coderocket/react/styles.css` and `@coderocket/blocks/styles.css` if using blocks. Put a `ThemeScope` around your interface so portalled controls share its typography and tokens:

```tsx
import { ThemeScope, Button, Card } from "@coderocket/react";
import "@coderocket/react/styles.css";

export function Example() {
  return (
    <ThemeScope>
      <Card title="Your workspace">
        <Button onClick={() => console.log("Connect your own save function")}>
          Save
        </Button>
      </Card>
    </ThemeScope>
  );
}
```

Callbacks belong in your own client component when using an SSR framework. They do not save data remotely, send email or take payment without your implementation.

## A local Vue consumer

Add a Vue consumer to the workspace with these dependencies:

```json
{
  "dependencies": {
    "@coderocket/vue": "workspace:*",
    "@coderocket/engine": "workspace:*",
    "vue": "3.5.43"
  }
}
```

Use your normal Vue bundler, such as Vite with its Vue plugin. Build the core first. The compiled Vue stylesheet includes component and block styles:

```vue
<script setup lang="ts">
import { Button, Card, ThemeScope } from "@coderocket/vue";
import "@coderocket/vue/styles.css";

function save() {
  console.log("Connect your own save function");
}
</script>

<template>
  <ThemeScope>
    <Card title="Your workspace">
      <Button @click="save">Save</Button>
    </Card>
  </ThemeScope>
</template>
```

Vue blocks are exported from `@coderocket/vue/blocks`. The components use Vue's slots, emitted events and `v-model`. They are not React wrappers. The two frameworks share the catalogue and design tokens, but Base UI-specific imperative handles, transition details and drawer snap points do not have identical Vue counterparts.

For standalone Studio exports, follow the [Vue installation and Nuxt guide](https://ui.coderocket.app/docs/vue). Exported sources have relative application imports and separate `styles/components.css`, `styles/blocks.css` and `styles/theme.css`; these paths differ from the built workspace package above.

## Design model and specifications

`@coderocket/engine` validates the versioned model and generates theme CSS. `@coderocket/specs` describes the catalogue and validates bounded compositions of known primitives. These can be used locally without an AI provider or hosted account. Apply a generated theme after the component styles when supplying your own tokens.

A library's explicit tokens, recipes and specifications remain its source of truth. AI proposals are inputs to validate and review, not permission to execute arbitrary code.

## Documentation

The Markdown/MDX and navigation metadata in [`docs/content`](content) are public source. Their `/docs/...` links are website routes; use [the hosted documentation](https://ui.coderocket.app/docs) to navigate them. React and Vue have equivalent component and block sections. The website shell, live-preview host and account UI are part of the separately maintained hosted application.

## Hosted registry integrations

The [CLI](../packages/cli/README.md) and [MCP](../packages/mcp/README.md) share a read-only registry client. They need a saved library ID and scoped connection token for remote reads. The saved framework selects React or Vue source and dependencies automatically. This repository does not include the registry backend or account service. `coderocket import` is local analysis and does not need a token.

## Legacy documentation

The frozen project is isolated in `legacy/vue-tailwind-datepicker`, including its npm lockfiles. To reproduce it:

```sh
npm ci --prefix legacy/vue-tailwind-datepicker
npm --prefix legacy/vue-tailwind-datepicker run typecheck
npm --prefix legacy/vue-tailwind-datepicker run check:package
npm ci --prefix legacy/vue-tailwind-datepicker/docs
DOCS_BASE=/ npm --prefix legacy/vue-tailwind-datepicker run docs:build
```

Its API and npm name are unchanged. These commands reproduce the historical source; they do not imply ongoing maintenance or publication.
