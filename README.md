<p align="center">
  <a href="https://ui.coderocket.app">
    <img src="docs/assets/brand/coderocket-mark.svg" alt="CodeRocket UI" width="88" height="88" />
  </a>
</p>

<h1 align="center">CodeRocket UI</h1>

<p align="center">React and Vue components. Your design system. Source you own.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@coderocketapp/cli"><img src="https://img.shields.io/npm/v/%40coderocketapp%2Fcli?label=CLI" alt="CLI on npm" /></a>
  <a href="https://www.npmjs.com/package/@coderocketapp/mcp"><img src="https://img.shields.io/npm/v/%40coderocketapp%2Fmcp?label=MCP" alt="MCP on npm" /></a>
  <a href="https://github.com/elreco/coderocket-ui/actions/workflows/check.yml"><img src="https://img.shields.io/github/actions/workflow/status/elreco/coderocket-ui/check.yml?branch=main&amp;label=checks" alt="Public core checks" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/elreco/coderocket-ui" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://ui.coderocket.app/studio">Open Studio</a> ·
  <a href="https://ui.coderocket.app/docs/components">React docs</a> ·
  <a href="https://ui.coderocket.app/docs/vue/components">Vue docs</a> ·
  <a href="https://ui.coderocket.app/docs/agents">Coding agents</a>
</p>

**Build a component library that looks like your product, with design rules your coding agents can use.**

CodeRocket UI combines React and Vue components, interface blocks, a typed design-system model, and CLI/MCP integrations. Start from accessible primitives, customize shared tokens, and keep editable source in your application. The open-source core is **MIT licensed**, written in **TypeScript**, and works **with or without Tailwind**.

## Two frameworks, one design system

React uses Base UI. Vue uses native Vue single-file components and Reka UI. Both catalogues share tokens, layouts and core behavior, including date and range selection, forms, overlays and application blocks. Vue APIs use `v-model`, events and slots; framework-specific APIs are not interchangeable.

Use the components directly from this source workspace, or use the [hosted Studio](https://ui.coderocket.app/studio) to customize a library visually, review AI proposals and export its source. An account or AI provider is **not required** to use the open-source components locally. Svelte and SolidJS are planned, without announced release dates.

## Start with your own library

1. Open [Studio](https://ui.coderocket.app/studio) and create a React or Vue library.
2. Customize its tokens, components and blocks. AI assistance is optional.
3. Save, then **Export** a ZIP or use **Connect** to install the source through the CLI.

Exported components run locally without a CodeRocket connection. Follow the [React installation guide](https://ui.coderocket.app/docs/export) or [Vue and Nuxt guide](https://ui.coderocket.app/docs/vue) for dependencies and styles.

### Install and update source with the CLI

The CLI is available on npm as [`@coderocketapp/cli`](https://www.npmjs.com/package/@coderocketapp/cli). In Studio, open your saved library's **Connect** dialog and create a scoped connection token. Set `CODEROCKET_LIBRARY` and `CODEROCKET_TOKEN` in your environment, then run these commands from your application directory:

```sh
npx @coderocketapp/cli@latest init
npx @coderocketapp/cli@latest list
npx @coderocketapp/cli@latest add button
npx @coderocketapp/cli@latest sync
```

The library selects React or Vue source automatically. `sync` preserves local changes and puts conflicting updates aside for review. Keep connection tokens out of version control. See the [CLI guide](packages/cli/README.md) for blocks, complete-library installation and local import analysis.

### Give coding agents the same design rules

[`@coderocketapp/mcp`](https://www.npmjs.com/package/@coderocketapp/mcp) exposes a saved library's design rules, components and blocks through a read-only MCP server. Follow the [MCP setup guide](packages/mcp/README.md) to connect a compatible coding agent.

The CLI and MCP need no AI provider key. Agents can also use the [public Markdown documentation](docs/content), typed specifications and exported `AGENTS.md`. Review generated source before applying it to your application.

## What is open source?

| Package                                 | What it provides                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`@coderocket/react`](packages/react)   | React components, Base UI primitives, compiled CSS and a composition renderer.               |
| [`@coderocket/blocks`](packages/blocks) | React interface blocks with typed application callbacks.                                     |
| [`@coderocket/vue`](packages/vue)       | Vue components and blocks, Reka UI primitives, CSS and a composition renderer.               |
| [`@coderocket/engine`](packages/engine) | Versioned design-system model, token validation, theme generation and reviewed token import. |
| [`@coderocket/specs`](packages/specs)   | Shared catalogue specifications and validated composition schemas.                           |
| [`@coderocket/shared`](packages/shared) | Types and a read-only registry client for the integration tools.                             |
| [`@coderocketapp/cli`](packages/cli)    | Local import analysis and installation/sync from a saved library, preserving local changes.  |
| [`@coderocketapp/mcp`](packages/mcp)    | A read-only MCP server exposing a saved library's rules and component sources.               |

**CLI and MCP are distributed on npm.** The component and model packages remain source workspaces: build them locally, or use Studio exports and the CLI to install editable component source. The `@coderocket/react` and `@coderocket/vue` workspace names do not imply npm availability.

The [documentation source](docs/content) is public too. It is rendered at [ui.coderocket.app/docs](https://ui.coderocket.app/docs) by the separately maintained website.

The hosted Studio, accounts, database, AI-provider integration and commercial operations remain private. Authentication, payments, email delivery and uploads are not bundled component backends: blocks expose callbacks for your own application. The CLI's registry commands and MCP need a saved library and scoped connection token, or a compatible registry server.

The catalogue is experimental during early access. Review accessibility, behavior and framework integration in your application's context before release.

## Build from source

Use the Node.js and pnpm versions declared in [`package.json`](package.json):

```sh
git clone https://github.com/elreco/coderocket-ui.git
cd coderocket-ui
pnpm install --frozen-lockfile
pnpm check
```

The checks validate and build the workspace and run its tests without contacting the Studio or an AI provider. The legacy datepicker is outside this pnpm workspace.

### React workspace consumer

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

### Vue workspace consumer

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

See [development and integration](docs/DEVELOPMENT.md) for consumer dependencies, styles and framework differences.

## From Vue Tailwind Datepicker

This is the same repository, with its stars, issues and Git history. CodeRocket UI is its active successor; it is **not a drop-in replacement** for the old datepicker API.

**Vue Tailwind Datepicker is frozen and no longer maintained.** Its npm package, [`@coderocketapp/vue-tailwind-datepicker`](https://www.npmjs.com/package/@coderocketapp/vue-tailwind-datepicker), remains available. Its source, original MIT attribution, changelog and documentation are preserved in [`legacy/vue-tailwind-datepicker`](legacy/vue-tailwind-datepicker). Existing applications can continue using their installed version; no automatic migration is required. No further legacy fixes or releases are planned.

For new work, explore the [Vue DatePicker](https://ui.coderocket.app/docs/vue/components/date-picker) or [React DatePicker](https://ui.coderocket.app/docs/components/date-picker). Read the [transition announcement](ANNOUNCEMENT.md) and [legacy documentation](https://vue-tailwind-datepicker.com) before migrating.

## Hosted access and Pro

The hosted editor, component catalogue and source export are free. AI assistance has usage limits; see [current access and allowances](https://ui.coderocket.app/docs/pilot). Pro price, payment and activation are arranged personally, with no automatic billing or renewal. Manual editing and export remain usable without AI allowance.

[Request Pro or integration help](https://ui.coderocket.app/contact?intent=pro), or read [how access works](https://ui.coderocket.app/docs/pilot). Submitting a request does not charge you or activate paid access. GitHub stars and historical datepicker use are not permission for sales outreach.

## Contributing and licensing

See [CONTRIBUTING.md](CONTRIBUTING.md), [the roadmap](docs/ROADMAP.md), [MIT license](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md). Contributions belong in the active packages and documentation. The legacy datepicker remains an unmaintained reference.
