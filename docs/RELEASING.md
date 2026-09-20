# Releasing CLI and MCP clients

The public npm packages are `@coderocketapp/cli` and `@coderocketapp/mcp`.
The internal `@coderocket/*` manifests stay private to prevent accidentally
publishing source workspace dependencies. `pnpm clients:pack` builds standalone
public packages into `.release/`, with metadata, executable code and licenses only.

## Validate a release

1. Update `version` in both `packages/cli/package.json` and `packages/mcp/package.json`
   to the same next version. Keep the Studio copies in sync.
2. Update the client READMEs for changed commands. Installation examples use
   `@latest`; badges read their versions from npm.
3. Run `pnpm check`. This includes installation of both real archives in a clean
   temporary application, CLI installation/sync conflict checks and an MCP session.
4. Review and merge the release into `main`.
5. Tag that commit `clients-vX.Y.Z`, using the version from the manifests, and push
   that tag. The `Publish npm clients` workflow checks the tag, rebuilds, tests and
   publishes both packages with provenance through npm trusted publishing.

Publication is versioned independently from the legacy datepicker and does not
publish the hosted Studio or its server code. A retry verifies the integrity of any
already published version and skips it only when its bytes match exactly.

## First publication and npm authentication

Each package requires an npm trusted publisher for `elreco/coderocket-ui`, workflow
`publish-clients.yml`, with direct publishing allowed. No long-lived npm token is
stored in GitHub. Creating this relationship requires npm account authentication.
New package names must be published once before configuring their trusted publisher.

After `pnpm clients:pack && pnpm clients:check`, a maintainer with npm write access
can publish the exact archives listed in `.release/manifest.json` using
`npm publish .release/<filename> --access public --ignore-scripts` and complete npm's
interactive authentication. Then configure each package:

```sh
npm trust github @coderocketapp/cli --repo elreco/coderocket-ui --file publish-clients.yml --allow-publish
npm trust github @coderocketapp/mcp --repo elreco/coderocket-ui --file publish-clients.yml --allow-publish
```

Verify package versions and install from npm in a fresh application before updating
production installation instructions. Future releases use the tag workflow.
Published versions are immutable: fix an issue in a new version instead of deleting
an existing release. The CLI's old quality-gate release remains accessible by its
original version; new releases provide CodeRocket UI library installation.
