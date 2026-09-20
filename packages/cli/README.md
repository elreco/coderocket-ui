# CodeRocket CLI

Install and update a saved CodeRocket library as editable React or Vue source in your application. The CLI fetches your library's components, blocks, theme and integration rules, and preserves locally edited files.

Requires **Node.js 24 or newer** and npm. Run commands from your application folder. `npx` runs the official [`@coderocketapp/cli`](https://www.npmjs.com/package/@coderocketapp/cli) package without a global installation.

## Connect a saved library

1. Open [CodeRocket Studio](https://ui.coderocket.app), create a React or Vue library, and save it.
2. Open **Connect**, create a connection, and copy its token. Tokens are shown once, scoped to one library, read-only, and expire after 90 days. You can revoke a connection from the same dialog.
3. Copy the library ID from the setup command in **Connect**. Run the following in bash or zsh, paste the token at the hidden prompt, then press Enter:

```bash
printf "Connection token: "
read -rs CODEROCKET_TOKEN
export CODEROCKET_TOKEN
printf "\n"
npx @coderocketapp/cli@latest init YOUR_LIBRARY_ID
npx @coderocketapp/cli@latest add button dialog
```

The hidden prompt keeps the token out of shell history. Keep it in your terminal or secret environment; the CLI does not write it to project files. Set it again in a new terminal, or inject it through your development environment's secret settings. Do not put tokens in source, AI prompts, URLs or version control.

You can also provide the library ID through the environment:

```sh
export CODEROCKET_LIBRARY="YOUR_LIBRARY_ID"
npx @coderocketapp/cli@latest init
```

The hosted registry requires a CodeRocket account, a saved library and its connection token. The [MIT-licensed component source](https://github.com/elreco/coderocket-ui) can be used without an account. Installed source and CSS run locally without a CodeRocket connection.

## Commands

| Command                                              | Result                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `npx @coderocketapp/cli@latest init YOUR_LIBRARY_ID` | Connect this project and install the library's shared files  |
| `npx @coderocketapp/cli@latest list`                 | List the connected library's available components and blocks |
| `npx @coderocketapp/cli@latest add button dialog`    | Install named components and their required files            |
| `npx @coderocketapp/cli@latest add block-login`      | Install a complete block                                     |
| `npx @coderocketapp/cli@latest add --all`            | Install the full catalogue                                   |
| `npx @coderocketapp/cli@latest sync`                 | Update the items already selected in this project            |
| `npx @coderocketapp/cli@latest import`               | Analyze the local project and write an import report         |
| `npx @coderocketapp/cli@latest --help`               | Show command help                                            |

Run `init` once per project. Later commands use the saved library ID in `.coderocket/manifest.json`. Save your changes in the Studio before syncing; connections read saved versions.

`list` reads the catalogue without installing files. Use `npx @coderocketapp/cli@latest list components` or `list blocks` to filter it. You can also list before initialization by setting `CODEROCKET_LIBRARY` and `CODEROCKET_TOKEN`. Help and version commands do not require credentials; use `npx @coderocketapp/cli@latest --version` to check the installed version.

`import` writes `.coderocket/import-report.json` with detected dependencies, CSS variables, fonts and component paths. It does not upload files or change source, and does not require a connection token. Review the report before using it in the Studio. Move an existing report aside before generating another.

## Use the installed source

The CLI prints the runtime dependencies required by your library. Install those in your application; it does not install them automatically. The saved library determines whether you receive React or Vue source.

Import `styles/components.css`, `styles/blocks.css` when using blocks, then `styles/theme.css` once in your entry point. Wrap the application in the exported `ThemeScope` so overlays inherit the theme. Follow the generated `.coderocket/README.md` for your framework's imports and setup.

Components live in `components/ui/`; blocks live in `components/blocks/`. These are local source files you can edit. Connect application actions, authentication and backend services yourself.

Commit the installed files, `.coderocket/manifest.json` and `.coderocket/lock.json`. Integration instructions and design rules are written to `.coderocket/README.md` and `.coderocket/AGENTS.md`, preserving any project-level files with those names. Merge relevant design rules into your existing agent instructions.

## Updates and local edits

The CLI compares file hashes before updating. If a file has been edited or deleted locally, the installation stops and writes proposed replacements to `.coderocket/review-*/incoming/`, with existing content in `current/`. Installed source and the installation lock remain unchanged; the command exits with code `2`.

Compare the files and choose the changes to keep. If you accept an incoming file exactly, a later sync can record it. A file that retains your own edits continues to require review when the incoming source differs; the CLI never assumes that a merge is safe.

## Environment and troubleshooting

| Variable             | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `CODEROCKET_TOKEN`   | Required for hosted registry access; use the token for this library    |
| `CODEROCKET_LIBRARY` | Alternative library ID for `init`, or for `list` before initialization |
| `CODEROCKET_SERVER`  | Optional server origin; defaults to `https://ui.coderocket.app`        |

For a different Studio deployment, set `CODEROCKET_SERVER` to its HTTPS origin before `init` and keep it set for later commands. Local development also supports HTTP on localhost. The CLI checks the project's saved server before sending credentials.

If a token has expired or been revoked, create another connection for the same library and update `CODEROCKET_TOKEN`. If the CLI reports an existing connection, use `add` or `sync`. After an interrupted command, verify that no CodeRocket process is running before removing the lock file named in the error.

See the [installation guide](https://ui.coderocket.app/docs/export), [Vue and Nuxt guide](https://ui.coderocket.app/docs/vue), and [coding-agent setup](https://ui.coderocket.app/docs/agents). For MCP clients, use [`@coderocketapp/mcp`](https://www.npmjs.com/package/@coderocketapp/mcp).
