# Current scope

## Available in the open-source core

- 48 components and 26 interface blocks for **React and Vue**, with CSS and native framework APIs.
- Base UI primitives for React and Reka UI primitives for Vue.
- A typed, versioned design-system model and shared catalogue specifications.
- Local token analysis and reviewed model changes.
- CLI installation/sync that preserves local file changes.
- A read-only MCP server exposing a saved library in its chosen framework.
- Public Markdown/MDX documentation in [`docs/content`](content), rendered on the hosted website.

The catalogue is experimental. Fixes should be driven by real integrations, with particular care for keyboard behavior, focus, SSR, mobile and parity between the two frameworks. The historical datepicker is preserved separately; its API is not the new Vue library API.

## Next: validate integrations

The near-term goal is a small number of voluntary pilots using real applications. We want evidence that teams can build a coherent library, install it, preserve local edits and use the same components through a coding agent.

Svelte and SolidJS support is planned without announced release dates. Stronger import coverage and team workflows remain directions to validate. Framework-specific advanced APIs cannot always have identical implementations.

The hosted Studio has free editing/export and manually activated Pro AI access. These services are separate from the MIT-licensed source. Buying Pro does not guarantee a future framework release.

Vue Tailwind Datepicker remains frozen in `legacy/`, available for existing installations but without planned fixes or releases.
