# Release guide

The maintained npm package is `@coderocketapp/vue-tailwind-datepicker`.
It is separate from the previous unscoped package. Keep its MIT attribution when publishing.

## Local checks

Use Node 22.14+ or Node 24, then run:

```sh
npm ci
npm run typecheck
npm run check:package
npm ci --prefix docs
npm run docs:build
```

`npm ci` also builds the library through `prepare`. `check:package` verifies
that the npm archive includes the JavaScript entry points, declarations,
stylesheet, locale chunks and license, and that ESM and CommonJS imports work.

## First publication from a new npm account

The npm account must own the package scope. Authenticate using `npm login`,
check the account with `npm whoami`, and publish the verified build with
`npm publish --access public`. Complete npm's 2FA check when prompted.

Create the matching `v<version>` Git tag on the source commit of a manual release
before running semantic-release again.

## GitHub trusted publishing

In the npm package settings, configure a GitHub Actions trusted publisher:

- Organization or user: `elreco`
- Repository: `vue-tailwind-datepicker`
- Workflow filename: `release.yml`
- Environment: leave empty (the workflow does not use a GitHub environment)
- Allow direct publication, not only staged publication

The workflow runs on GitHub-hosted runners with Node 24 and npm 11+.
`id-token: write` allows npm's short-lived OIDC authentication and provenance.
No `NPM_TOKEN` repository or environment secret is used.

## Subsequent releases

Every push to `main` runs checks, builds the documentation and uses
semantic-release to publish a stable version. The workflow can also be run manually.

- `feat:` creates a minor release.
- `fix:` creates a patch release.
- A breaking change creates a major release.
- The extra patch rules in `package.json` cover refactors, tests, styles,
  performance, CI, build changes, chores and `docs(README):`.
- `no-release:` skips publication when no other releasable commits are present.

Pre-release branches use the same workflow and trusted publisher:
`develop` publishes on `dev`; `next`, `beta` and `alpha` publish on their respective channels.
Tags use semantic-release's standard `v<version>` format.

semantic-release creates the npm release, Git tag and GitHub release. Version
and changelog changes are made in the release workspace, not committed back to
`main`; npm and Git tags are the source of truth for the published version.

## Troubleshooting

For authentication failures, check the npm trusted publisher's exact repository
and workflow filename, npm version, runner type and `id-token` permission.
A local npm login does not configure GitHub Actions authentication.

For packaging failures, run `npm run build` followed by `npm run check:package`.
Do not publish a package missing its CSS, declarations or locale chunks.
