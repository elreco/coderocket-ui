# CodeRocket UI — React and Vue component libraries

**Build a component library that looks like your product, with design rules your coding agents can use.**

CodeRocket UI combines **48 components and 26 interface blocks for both React and Vue**, a typed design-system model, and CLI/MCP integrations. Start from accessible primitives, customize shared tokens, and keep editable source in your application. The core is **MIT licensed**, written in **TypeScript**, and works **with or without Tailwind**.

[Try the visual builder](https://ui.coderocket.app) · [React documentation](https://ui.coderocket.app/docs/components) · [Vue documentation](https://ui.coderocket.app/docs/vue/components) · [Request Pro access](https://ui.coderocket.app/contact?intent=pro)

## Two frameworks, one design system

React uses Base UI. Vue uses native Vue single-file components and Reka UI. Both catalogues share tokens, layouts and core behavior, including date and range selection, forms, overlays and application blocks. Vue APIs use `v-model`, events and slots; framework-specific APIs are not interchangeable.

Use the components directly from this source workspace, or use the [hosted Studio](https://ui.coderocket.app/studio) to customize a library visually, review AI proposals and export its source. An account or AI provider is **not required** to use the open-source components locally. Svelte and SolidJS are planned, without announced release dates.

## What is open source?

| Package                                 | What it provides                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`@coderocket/react`](packages/react)   | 48 React components, Base UI primitives, compiled CSS and a composition renderer.            |
| [`@coderocket/blocks`](packages/blocks) | 26 React interface blocks with typed application callbacks.                                  |
| [`@coderocket/vue`](packages/vue)       | 48 Vue components and 26 Vue blocks, Reka UI primitives, CSS and a composition renderer.     |
| [`@coderocket/engine`](packages/engine) | Versioned design-system model, token validation, theme generation and reviewed token import. |
| [`@coderocket/specs`](packages/specs)   | Shared catalogue specifications and validated composition schemas.                           |
| [`@coderocket/shared`](packages/shared) | Types and a read-only registry client for the integration tools.                             |
| [`@coderocket/cli`](packages/cli)       | Local import analysis and installation/sync from a saved library, preserving local changes.  |
| [`@coderocket/mcp`](packages/mcp)       | A read-only MCP server exposing a saved library's rules and component sources.               |

The [documentation source](docs/content) is public too. It is rendered at [ui.coderocket.app/docs](https://ui.coderocket.app/docs) by the separately maintained website.

The hosted Studio, accounts, database, AI-provider integration and commercial operations remain private. Authentication, payments, email delivery and uploads are not bundled component backends: blocks expose callbacks for your own application. The CLI's registry commands and MCP need a saved library and scoped connection token, or a compatible registry server.

The catalogue is experimental. Review accessibility, behavior and framework integration in your application's context before release.

## Build from source

Use Node.js 24+ and pnpm 12.4.2. **This is a source distribution**: workspace package names do not imply a public npm release.

```sh
git clone https://github.com/elreco/coderocket-ui.git
cd coderocket-ui
pnpm install --frozen-lockfile
pnpm check
```

The checks validate and build the workspace and run its tests without contacting the Studio or an AI provider. The legacy datepicker is outside this pnpm workspace.

### React

Add `@coderocket/react` as a `workspace:*` dependency in a pnpm workspace consumer. Import its compiled styles once:

```tsx
import { Button, ThemeScope } from "@coderocket/react";
import "@coderocket/react/styles.css";

export function App() {
  return (
    <ThemeScope>
      <Button onClick={() => console.log("Saved locally")}>Save changes</Button>
    </ThemeScope>
  );
}
```

### Vue

Add `@coderocket/vue` as a `workspace:*` dependency in a Vue workspace consumer:

```vue
<script setup lang="ts">
import { Button, ThemeScope } from "@coderocket/vue";
import "@coderocket/vue/styles.css";
</script>

<template>
  <ThemeScope><Button>Save changes</Button></ThemeScope>
</template>
```

See [development and integration](docs/DEVELOPMENT.md) for consumer dependencies, styles and framework differences. React 19.3 / Base UI 1.8 and Vue 3.5 / Reka UI 2.10 are the versions used by this source release.

### Coding agents, CLI and MCP

After building, run `node packages/cli/dist/index.mjs --help`. Follow the [CLI guide](packages/cli/README.md) for installation and sync, or the [MCP guide](packages/mcp/README.md) to expose a saved library to a compatible coding agent. The library's framework determines the returned source. No Gemini or other AI provider key is required by these clients.

[Markdown documentation](docs/content), typed specifications and a read-only MCP interface help agents use the same components and design rules as developers. Generated source still needs review before application.

## From Vue Tailwind Datepicker

This is the same repository, with its stars, issues and Git history. CodeRocket UI is its active successor; it is **not a drop-in replacement** for the old datepicker API.

**Vue Tailwind Datepicker is frozen and no longer maintained.** Its npm package, `@coderocketapp/vue-tailwind-datepicker`, remains available. Its source, original MIT attribution, changelog and documentation are preserved in [`legacy/vue-tailwind-datepicker`](legacy/vue-tailwind-datepicker). Existing applications can continue using their installed version; no automatic migration is required. No further legacy fixes or releases are planned.

For new work, explore the [Vue DatePicker](https://ui.coderocket.app/docs/vue/components/date-picker) or [React DatePicker](https://ui.coderocket.app/docs/components/date-picker). Read the [transition announcement](ANNOUNCEMENT.md) and [legacy documentation](https://vue-tailwind-datepicker.com) before migrating.

## Hosted access and Pro

The hosted editor, component catalogue and source export are free. Signed-in accounts receive **5 trial AI generations in total**. Pro adds **100 AI generations per UTC calendar month** during an agreed paid period, subject to the shared service limit. Price, payment and activation are arranged personally; there is no automatic billing or renewal. Manual editing and export remain usable without AI allowance.

[Request Pro or integration help](https://ui.coderocket.app/contact?intent=pro), or read [how access works](https://ui.coderocket.app/docs/pilot). Submitting a request does not charge you or activate paid access. GitHub stars and historical datepicker use are not permission for sales outreach.

## Contributing and licensing

See [CONTRIBUTING.md](CONTRIBUTING.md), [the roadmap](docs/ROADMAP.md), [MIT license](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md). Contributions belong in the active packages and documentation. The legacy datepicker remains an unmaintained reference.
