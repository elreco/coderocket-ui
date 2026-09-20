# CodeRocket CLI

A MIT-licensed client to bring a saved library into your project while preserving local changes. Requires Node.js 24+.

## Build

From the repository root, run `pnpm install --frozen-lockfile` and `pnpm build`. Then run `node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs --help`. The absolute path lets you invoke it from your application's working directory. Workspace package names do not imply a public npm release.

## Local analysis, without an account

Inside an application with a `package.json`:

```sh
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs import
```

This writes `.coderocket/import-report.json` locally. It inventories dependencies, component filenames and CSS variables. It does not upload source, execute project configuration or change application source. It skips symlinks and hidden/build directories and bounds traversal. An existing report is preserved; move it aside before requesting another one. The report does not automatically adopt arbitrary component implementations.

## Connect a saved library

In [the Studio](https://ui.coderocket.app/studio), save a library and create a scoped token from **Connect**. Supply its values through your terminal or secret manager:

```sh
export CODEROCKET_LIBRARY="YOUR_LIBRARY_UUID"
export CODEROCKET_TOKEN="YOUR_SCOPED_CONNECTION_TOKEN"
# Optional; this is also the default.
export CODEROCKET_SERVER="https://ui.coderocket.app"
```

These are placeholders. Do not commit tokens or paste real values into issues. The CLI never stores the token in project files. The following commands require a saved library; this repository does not contain the hosted account or registry backend.

From your application directory:

```sh
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs init
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs add button dialog
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs add block-login
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs add --all
node /absolute/path/to/coderocket-ui/packages/cli/dist/index.mjs sync
```

`init` records the library connection. `add` selects catalogue items; `sync` updates the existing selection. The server setting is checked against the saved manifest before credentials are sent. HTTPS is required outside localhost, redirects are rejected and responses are bounded.

## Protect local work

Commit the manifest and content hashes in `.coderocket/` with installed source. The CLI validates paths and does not follow symlinks outside the project. If an installed file has changed locally, it is preserved and proposed replacements go into a review directory. Exit code 2 means local conflicts need review. Resolve differences before syncing again; edits are not silently overwritten.

Generated README, license and agent instructions are placed under `.coderocket/`, preserving your application's root files. Review `.coderocket/AGENTS.md` before including it in your coding agent's context.

Install the consumer dependencies reported for your saved library: React libraries use React 19.3, React DOM 19.3 and Base UI 1.8; Vue libraries use Vue 3.5.43, Reka UI 2.10.4 and `@lucide/vue` 1.47.0. The framework is taken from the saved library, so Vue connections return Vue single-file components rather than JSX. Import `styles/components.css`, `styles/blocks.css` when using blocks, and then `styles/theme.css`. Tailwind is optional. Use the exported `ThemeScope` so portalled elements share the theme. Installed components run locally without a CodeRocket runtime connection. Revoke tokens in the Studio when no longer needed.
