# CodeRocket registry client

MIT-licensed `Snapshot` and `Bundle` types, server-origin validation and a bounded read-only request helper for the CLI and MCP clients.

Contains no account implementation or credential. Remote reads require a scoped token supplied at runtime. Redirects and unsafe origins are rejected, HTTPS is required outside localhost, and timeout/response-size limits are enforced.
