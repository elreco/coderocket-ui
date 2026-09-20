# Contributing to CodeRocket UI

Use Node.js 24+ and pnpm 12.4.2. Run `pnpm install --frozen-lockfile`, then `pnpm check` before opening a pull request. Build outputs are ignored; commit source changes and the lockfile when dependencies change.

## Components and documentation

The active workspaces are in `packages/`. React and Vue implementations share the catalogue specifications and design-system model. Keep behavior and specifications aligned across both frameworks where their APIs allow it. Preserve keyboard interaction, focus, explicit labels, theme inheritance and mobile layouts. Tailwind must remain optional for consumers. Add tests for meaningful behavior changes.

The public website's Markdown/MDX documentation is in `docs/content`. It is rendered by the separately maintained website at [ui.coderocket.app/docs](https://ui.coderocket.app/docs). Update React and Vue reference material together when shared behavior changes; use framework-specific examples for JSX versus Vue slots, events and `v-model`.

When you change files covered by the public source manifest, refresh it before running checks:

```sh
node tooling/check-source-manifest.mjs --write
pnpm check
```

This command only updates content hashes; it does not upload source or require access to the private application. Include the resulting manifest change in the pull request. Follow [the repository boundary guide](docs/REPOSITORY-TRANSITION.md) when reviewing synchronized source.

## Report an issue

For current components, provide a minimal reproduction, repository revision, framework and version, browser details and the expected behavior. State whether the issue concerns the public component or hosted Studio. Do not include credentials, connection tokens, customer data or private source.

The legacy Vue datepicker is frozen. Its issues and source remain available for reference; new maintenance or feature releases are not planned there.

## Repository boundaries and license

The hosted application's authentication, database, AI-provider services and commercial operations are maintained separately. Do not add credentials, customer records, private deployment configuration or server source to this repository. Registry examples must use placeholders.

By contributing, you agree to make your contribution available under this repository's MIT license. Preserve existing third-party notices and attribution. Review experimental components in your own application's context before release.
