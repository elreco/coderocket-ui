# CodeRocket MCP

A read-only MCP server that gives your coding agent access to a saved CodeRocket library: its design system, integration rules, components, blocks, source files and dependencies. React libraries return React source; Vue libraries return native Vue single-file components.

Requires **Node.js 24 or newer**, npm, and an MCP client that supports local stdio servers. The official [`@coderocketapp/mcp`](https://www.npmjs.com/package/@coderocketapp/mcp) package runs through `npx`; no global installation is needed.

## Create a connection

1. Open [CodeRocket Studio](https://ui.coderocket.app), create a library, and save it.
2. Open **Connect**, create a connection for your coding agent, and copy the token shown once.
3. Copy the library ID from the MCP configuration in **Connect**.

A token grants read-only access to one library, expires after 90 days, and can be revoked from **Connect**. Hosted registry access requires an account, a saved library and its token. You can use the [MIT-licensed component source](https://github.com/elreco/coderocket-ui) without an account or this server.

## Configure your MCP client

Merge the following server into your client's MCP configuration. Replace the placeholders with your library ID and connection token:

```json
{
  "mcpServers": {
    "coderocket": {
      "command": "npx",
      "args": ["-y", "@coderocketapp/mcp@latest"],
      "env": {
        "CODEROCKET_LIBRARY": "YOUR_LIBRARY_ID",
        "CODEROCKET_TOKEN": "YOUR_CONNECTION_TOKEN"
      }
    }
  }
}
```

Keep this configuration private and outside version control. The `env` fields become environment variables for the server process. If your client offers protected secret settings, provide `CODEROCKET_TOKEN` there and remove the token entry from this JSON. Never place tokens in prompts, source files, URLs or command arguments.

MCP clients differ in where they store configuration; use your client's local stdio server settings. Restart or reconnect the server after updating its configuration. The client launches and manages the process. With valid connection environment variables, a server started manually waits for MCP messages on standard input; missing settings produce setup guidance.

## Environment

| Variable             | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `CODEROCKET_LIBRARY` | Required saved library ID from the Studio                       |
| `CODEROCKET_TOKEN`   | Required connection token for that library                      |
| `CODEROCKET_SERVER`  | Optional server origin; defaults to `https://ui.coderocket.app` |

For a different Studio deployment, add `CODEROCKET_SERVER` to the server environment using its HTTPS origin, without a path or credentials. Local development also supports HTTP on localhost.

## Available tools

| Tool                | Returns                                                         |
| ------------------- | --------------------------------------------------------------- |
| `get_design_system` | The latest saved design model and revision                      |
| `get_design_rules`  | Component conventions, token rules and integration instructions |
| `list_components`   | Available component names and descriptions                      |
| `search_components` | Components matching a `query`                                   |
| `get_component`     | Source files, dependencies and installation paths for a `slug`  |
| `list_blocks`       | Available block names and descriptions                          |
| `search_blocks`     | Blocks matching a `query`                                       |
| `get_block`         | Source files, dependencies and installation paths for a `slug`  |

The `coderocket://design-rules` resource exposes the same integration rules as Markdown.

Try asking your agent:

> Read my CodeRocket design rules and build a settings form with the library's input, select and button components. Install the required dependencies and import the theme styles.

The server reads your saved library. It does not save Studio changes or write project files. Your coding agent applies source changes using its own tools and permissions. Review those changes in your application. Save changes in the Studio before asking the agent to fetch an updated design.

## Troubleshooting

Check package availability and setup instructions without credentials:

```sh
npx -y @coderocketapp/mcp@latest --help
npx -y @coderocketapp/mcp@latest --version
```

- If the client cannot find `npx`, make sure Node.js and npm are available to the application that launches the MCP server.
- If a token is expired or revoked, create another connection for the same library, update the server environment and reconnect.
- If the library cannot be read, confirm that its ID and token belong to the same saved library and that `CODEROCKET_SERVER` points to the Studio that created them.
- If the catalogue appears unchanged, save the library in the Studio and request it again. Unsaved previews are not exposed.

Use [`@coderocketapp/cli`](https://www.npmjs.com/package/@coderocketapp/cli) to install and sync source from a terminal with local-edit protection. See the [coding-agent guide](https://ui.coderocket.app/docs/agents) for integration details.
