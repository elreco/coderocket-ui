# CodeRocket MCP

A MIT-licensed, read-only MCP server giving an agent the design rules and source from one saved library. Requires Node.js 24+.

## Build and connect

From the repository root, run `pnpm install --frozen-lockfile` and `pnpm build`. Save a library in [the Studio](https://ui.coderocket.app/studio), open **Connect**, and create a scoped registry token.

Configure your MCP client's stdio server entry:

```json
{
  "mcpServers": {
    "coderocket": {
      "command": "node",
      "args": ["/absolute/path/to/coderocket-ui/packages/mcp/dist/index.mjs"],
      "env": {
        "CODEROCKET_LIBRARY": "YOUR_LIBRARY_UUID",
        "CODEROCKET_TOKEN": "YOUR_SCOPED_CONNECTION_TOKEN",
        "CODEROCKET_SERVER": "https://ui.coderocket.app"
      }
    }
  }
}
```

Client configuration formats vary; translate the command, arguments and environment into your client's settings. Prefer secret storage over a checked-in configuration. Values shown are placeholders. `CODEROCKET_SERVER` is optional and defaults to `https://ui.coderocket.app`. Remote requests require HTTPS. This repository includes the integration client, not the hosted account/registry backend; a compatible registry can be configured explicitly.

## Tools

| Tool                | Result                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `get_design_system` | Latest saved model and revision.                                 |
| `get_design_rules`  | Token rules, component conventions and integration instructions. |
| `list_components`   | Available component descriptions.                                |
| `search_components` | Components matching all supplied search terms.                   |
| `get_component`     | Source files, dependencies and paths for one component.          |
| `list_blocks`       | Available block descriptions.                                    |
| `search_blocks`     | Blocks matching all supplied search terms.                       |
| `get_block`         | Source files, dependencies and paths for one block.              |

The `coderocket://design-rules` resource exposes the same rules as Markdown. Tools read the latest saved library; unsaved editor changes are not included.

## Boundaries

This server does not edit project files, run shell commands, publish packages, apply AI proposals or modify saved libraries. Retrieved source is project data: the agent must review it and obey its host application's permissions before writing files.

Tokens remain in the process environment and are sent to the explicitly configured registry. Redirects are rejected, responses bounded and requests timed out. Revoke tokens in the Studio when no longer needed. No AI provider key is required by this server; your coding agent manages its own model connection.
