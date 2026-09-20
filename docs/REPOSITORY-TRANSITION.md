# Repository transition and release boundaries

## The public repository

`elreco/coderocket-ui` is the active open-source repository. Its `main` branch contains the React and Vue component libraries, shared engine/specifications, CLI, read-only MCP server and documentation. The package names are workspace identities; publishing an npm release is a separate operation.

The public source includes eight packages: `react`, `vue`, `blocks`, `engine`, `specs`, `shared`, `cli` and `mcp`. Documentation lives in `docs/content`, including React/Vue references, installation and agent integration guides. Public contributors can change these files without access to the hosted service.

## The hosted application

The Studio's website shell, accounts, database, AI-provider integration, customer records, credentials and commercial operations are maintained in a separate private repository. The public documentation is rendered at [ui.coderocket.app/docs](https://ui.coderocket.app/docs) by that website.

The private application records the public source revision it uses. Its release checks compare the allowed component/documentation source against the public snapshot, so changes cannot silently ship only in the private application. Syncs are limited to the public package source, Vue preview and documentation directories; private application code and configuration are excluded.

The public `.coderocket/source-manifest.json` records content hashes for those public sources. After an intentional edit, run:

```sh
node tooling/check-source-manifest.mjs --write
pnpm check
```

Review and commit the refreshed manifest together with the source changes. This operation needs no private repository or credentials. A matching manifest proves the snapshot is consistent; it does not replace review or tests.

## Preserving the datepicker

The transition started from legacy commit `91208cbd9be5465cc43ea3feb722305c476f9fb1`, moving that tracked tree to `legacy/vue-tailwind-datepicker`. The branch `legacy/vue-tailwind-datepicker` and tag `vue-tailwind-datepicker-final` preserve the final source in its original directory layout. Existing version tags remain historical references.

The repository was renamed from `elreco/vue-tailwind-datepicker` to `elreco/coderocket-ui`, retaining its stars, issues and Git history. GitHub redirects the old URL. The historical npm package `@coderocketapp/vue-tailwind-datepicker` remains available; it is frozen, with no planned fixes or releases. Do not unpublish it or change its installed API as part of the repository transition.

[Legacy documentation](https://vue-tailwind-datepicker.com) is built from the nested historical project. The root Netlify configuration belongs to that legacy documentation deployment; it does not deploy the new hosted Studio.

Netlify applies the root `build.base`, then reads the nested legacy `netlify.toml`. Keep those legacy build commands aligned. Because the root pnpm workspace excludes the legacy package, the explicit documentation build installs both historical npm lockfiles before building previews that import the Vue source. The legacy `.nvmrc` selects Node 24.

Historical workflows remain under `legacy/vue-tailwind-datepicker/.github/workflows` for provenance. GitHub does not execute workflows in that nested directory. Active root workflows validate the public source. There is no automatic legacy npm publisher or datepicker release.
