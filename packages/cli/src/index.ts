#!/usr/bin/env node
import {
  readFile,
  readdir,
  lstat,
  mkdir,
  open,
  unlink,
} from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  installFiles,
  atomicWrite,
  readOptional,
  safePath,
  type Lock,
} from "./files";

import {
  DEFAULT_SERVER,
  serverOrigin,
  registryRequest,
  type Snapshot,
  type Bundle,
} from "@coderocket/shared/registry-client";

declare const __CODEROCKET_VERSION__: string;
export const VERSION =
  typeof __CODEROCKET_VERSION__ === "string" ? __CODEROCKET_VERSION__ : "0.3.0";
const HELP = `CodeRocket CLI ${VERSION}

Usage: coderocket <command>
   or: npx @coderocketapp/cli@latest <command>

Commands:
  init <library-id>         Connect a saved library and install its theme
  list [components|blocks]  Browse the connected library's catalogue
  add button dialog        Install components by slug
  add block-login          Install a block by its prefixed slug
  add --all                Install the complete catalogue
  sync                     Update untouched files; preserve local changes
  import                   Analyse this project locally
  --help, -h               Show this help
  --version, -v            Show the installed version

Quick start (Node.js 24 or newer):
  1. Open your saved library's Connect panel in https://ui.coderocket.app.
  2. Copy its library ID and create a connection token.
  3. Set CODEROCKET_TOKEN using a hidden shell prompt or secret manager.
     In bash/zsh: read -rs CODEROCKET_TOKEN; export CODEROCKET_TOKEN
     Paste the token at the hidden prompt and press Enter.
  4. Run npx @coderocketapp/cli@latest init <library-id> in your project.
  5. Run npx @coderocketapp/cli@latest list, then add the slugs you need.

CODEROCKET_LIBRARY can supply the library ID for init or list before init.
CODEROCKET_SERVER optionally selects a different registry server.
Tokens are read only from CODEROCKET_TOKEN and never saved in project files.
Never include a token in command arguments or commit it to version control.`;

function validateArguments(args: string[]) {
  const [command, ...rest] = args;
  if (!["init", "list", "add", "sync", "import"].includes(command))
    throw new Error("Unknown command. Run coderocket --help.");
  if (rest.some((value) => /^--?token(?:=|$)/i.test(value)))
    throw new Error(
      "Tokens must be supplied through CODEROCKET_TOKEN, never as command arguments. Run coderocket --help for secure setup.",
    );
  if (
    command === "init" &&
    (rest.length > 1 || rest.some((value) => value.startsWith("-")))
  )
    throw new Error(
      "Usage: coderocket init <library-id>. Supply the token through CODEROCKET_TOKEN. Run coderocket --help for setup.",
    );
  if (
    command === "list" &&
    (rest.length > 1 ||
      (rest[0] && !["components", "blocks"].includes(rest[0])))
  )
    throw new Error("Usage: coderocket list [components|blocks].");
  if (["sync", "import"].includes(command) && rest.length)
    throw new Error(`Usage: coderocket ${command}.`);
  if (command === "add") {
    if (!rest.length)
      throw new Error(
        "Choose components or blocks with coderocket list, then run coderocket add <slug> or coderocket add --all.",
      );
    if (
      (rest.includes("--all") && rest.length !== 1) ||
      rest.some((value) => value.startsWith("-") && value !== "--all")
    )
      throw new Error(
        "Usage: coderocket add <slug>... or coderocket add --all.",
      );
  }
}

function requireConnection(libraryId: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(libraryId))
    throw new Error(
      "A valid library ID is required. Copy it from your saved library's Connect panel, then run coderocket init <library-id> or set CODEROCKET_LIBRARY.",
    );
  if (!/^cr_[A-Za-z0-9_-]{43}$/.test(token))
    throw new Error(
      "Set a valid CODEROCKET_TOKEN from your saved library's Connect panel. Use a hidden shell prompt or secret manager; run coderocket --help for setup.",
    );
}

export type Manifest = {
  schemaVersion: 1;
  server: string;
  libraryId: string;
  components: string[];
  blocks: string[];
  revision: number;
};
export async function readManifest(root: string): Promise<Manifest> {
  const source = await readOptional(
    await safePath(root, ".coderocket/manifest.json"),
  );
  if (!source)
    throw new Error(
      "This project is not connected. Run coderocket init <library-id> first. Run coderocket --help for setup.",
    );
  const data = JSON.parse(source) as Manifest;
  if (
    data.schemaVersion !== 1 ||
    !Array.isArray(data.components) ||
    !Array.isArray(data.blocks) ||
    typeof data.libraryId !== "string"
  )
    throw new Error("Unsupported manifest.");
  serverOrigin(data.server);
  return data;
}
export async function inspectCodebase(root: string) {
  const packageData = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  );
  const dependencies = {
    ...packageData.dependencies,
    ...packageData.devDependencies,
  };
  const cssVariables: Record<string, string> = {},
    fonts = new Set<string>(),
    components: string[] = [];
  let visited = 0;
  async function walk(dir: string) {
    if (visited > 2000) return;
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (
        entry.name.startsWith(".") ||
        [
          "node_modules",
          "dist",
          "build",
          "coverage",
          "storybook-static",
        ].includes(entry.name)
      )
        continue;
      const path = join(dir, entry.name);
      if ((await lstat(path)).isSymbolicLink()) continue;
      if (++visited > 2000) break;
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      const local = relative(root, path);
      if (/\.(tsx|vue)$/.test(path) && local.includes("components"))
        components.push(local);
      if (!/\.css$/.test(path) || (await lstat(path)).size > 250000) continue;
      const css = await readFile(path, "utf8");
      for (const match of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g))
        cssVariables[match[1]] = match[2].trim();
      for (const match of css.matchAll(/font-family\s*:\s*([^;{}]+);/g))
        fonts.add(match[1].trim());
    }
  }
  await walk(root);
  const tsconfig = await readOptional(resolve(root, "tsconfig.json"));
  return {
    schemaVersion: 1,
    framework: dependencies.nuxt
      ? "Nuxt"
      : dependencies.vue
        ? "Vue"
        : dependencies.next
          ? "Next.js"
          : dependencies.vite
            ? "Vite"
            : dependencies.react
              ? "React"
              : "Unknown",
    tailwind: dependencies.tailwindcss || null,
    dependencies,
    cssVariables,
    fonts: [...fonts],
    components,
    tsconfig: tsconfig || null,
    note: "Read-only local analysis. No files were uploaded or rewritten. Review tokens and aliases before applying them in the Studio.",
  };
}

async function run(
  args = process.argv.slice(2),
  root = process.cwd(),
  env = process.env,
) {
  const [command, ...rest] = args;
  if (command === "import") {
    const report = await inspectCodebase(root);
    const path = ".coderocket/import-report.json";
    if (await readOptional(await safePath(root, path)))
      throw new Error(
        "An import report already exists. Move it aside before generating a new analysis.",
      );
    await atomicWrite(root, path, JSON.stringify(report, null, 2) + "\n");
    console.log(`Analysis saved to ${path}. No source changes or uploads.`);
    return;
  }
  const server = serverOrigin(env.CODEROCKET_SERVER || DEFAULT_SERVER),
    token = env.CODEROCKET_TOKEN || "";
  let manifest: Manifest;
  const manifestExists =
    (await readOptional(await safePath(root, ".coderocket/manifest.json"))) !==
    undefined;
  if (command === "init" || (command === "list" && !manifestExists)) {
    if (command === "init" && manifestExists)
      throw new Error("This project is already connected. Use add or sync.");
    manifest = {
      schemaVersion: 1,
      server,
      libraryId:
        (command === "init" ? rest[0] : undefined) ||
        env.CODEROCKET_LIBRARY ||
        "",
      components: [],
      blocks: [],
      revision: 0,
    };
  } else {
    manifest = await readManifest(root);
    if (manifest.server !== server)
      throw new Error(
        "This project uses a different server. Set CODEROCKET_SERVER explicitly before sending your token.",
      );
  }
  requireConnection(manifest.libraryId, token);
  const snapshot = await registryRequest<Snapshot>(
    server,
    manifest.libraryId,
    "snapshot.json",
    token,
  );
  if (command === "list") {
    const kinds = rest[0]
      ? [rest[0] as "components" | "blocks"]
      : (["components", "blocks"] as const);
    const sections = kinds.map((kind) => {
      const items = snapshot[kind];
      return [
        `${kind === "components" ? "Components" : "Blocks"} (${items.length})`,
        ...items.map(
          (item) =>
            `  ${kind === "blocks" ? "block-" : ""}${item.slug}  ${item.name}`,
        ),
        ...(items.length ? [] : ["  No items available."]),
      ].join("\n");
    });
    const setup = manifestExists
      ? ""
      : `Connect this project first: npx @coderocketapp/cli@latest init ${manifest.libraryId}\n`;
    console.log(
      `${snapshot.name} — revision ${snapshot.revision}\n\n${sections.join("\n\n")}\n\n${setup}Install with: npx @coderocketapp/cli@latest add <slug>`,
    );
    return;
  }
  const selectedComponents = new Set(manifest.components),
    selectedBlocks = new Set(manifest.blocks);
  if (command === "add") {
    const requested = rest.includes("--all")
      ? [
          ...snapshot.components.map((item) => item.slug),
          ...snapshot.blocks.map((item) => "block-" + item.slug),
        ]
      : rest;
    if (!requested.length)
      throw new Error("Choose components or use add --all.");
    for (const item of requested) {
      const block = item.startsWith("block-");
      const slug = block ? item.slice(6) : item;
      if (
        !(block ? snapshot.blocks : snapshot.components).some(
          (spec) => spec.slug === slug,
        )
      )
        throw new Error(`Unknown item: ${item}`);
      (block ? selectedBlocks : selectedComponents).add(slug);
    }
  }
  const query = new URLSearchParams({
    components: [...selectedComponents].join(","),
    blocks: [...selectedBlocks].join(","),
  });
  const bundle = await registryRequest<Bundle>(
    server,
    manifest.libraryId,
    "bundle.json?" + query,
    token,
  );
  if (
    bundle.schemaVersion !== 1 ||
    bundle.libraryId !== manifest.libraryId ||
    !Number.isSafeInteger(bundle.revision) ||
    bundle.revision < 1 ||
    !bundle.files ||
    typeof bundle.files !== "object"
  )
    throw new Error("Invalid registry bundle.");
  if (bundle.revision < manifest.revision)
    throw new Error(
      "The registry returned an older version. No files were changed.",
    );
  const rawLock = await readOptional(
    await safePath(root, ".coderocket/lock.json"),
  );
  const lock: Lock | undefined = rawLock ? JSON.parse(rawLock) : undefined;
  if (
    lock &&
    (lock.schemaVersion !== 1 || !lock.files || typeof lock.files !== "object")
  )
    throw new Error("Invalid installation lock.");
  const files = Object.fromEntries(
    Object.entries(bundle.files).map(([path, content]) => [
      ["README.md", "LICENSE", "AGENTS.md"].includes(path)
        ? `.coderocket/${path}`
        : path,
      content,
    ]),
  );
  const result = await installFiles(root, files, bundle.revision, lock);
  if (!result.applied) {
    console.log(
      `Local edits preserved. No installed files changed.\nReview proposed replacements in ${result.reviewDir}:\n${result.conflicts.join("\n")}\nResolve the differences before running sync again.`,
    );
    process.exitCode = 2;
    return;
  }
  manifest = {
    ...manifest,
    components: [...selectedComponents],
    blocks: [...selectedBlocks],
    revision: bundle.revision,
  };
  await atomicWrite(
    root,
    ".coderocket/manifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
  const dependencyList = Object.entries(bundle.dependencies || {})
    .map(([name, version]) => `${name}@${version}`)
    .join(", ");

  console.log(
    `Installed library version ${bundle.revision}.\nRequired dependencies: ${dependencyList}.\nImport styles/components.css${manifest.blocks.length ? ", styles/blocks.css" : ""}, then styles/theme.css in your application entry.\nCommit .coderocket/manifest.json and lock.json with your components. Integration instructions are in .coderocket/README.md and .coderocket/AGENTS.md; include these rules in your coding agent context.`,
  );
}
export async function main(
  args = process.argv.slice(2),
  root = process.cwd(),
  env = process.env,
) {
  if (
    !args[0] ||
    args[0] === "help" ||
    args.includes("--help") ||
    args.includes("-h")
  ) {
    console.log(HELP);
    return;
  }
  if (args.length === 1 && ["--version", "-v"].includes(args[0])) {
    console.log(VERSION);
    return;
  }
  validateArguments(args);
  if (args[0] === "list") return run(args, root, env);
  await mkdir(await safePath(root, ".coderocket"), { recursive: true });
  const path = await safePath(root, ".coderocket/command.lock");
  const handle = await open(path, "wx").catch(() => {
    throw new Error(
      "Another CodeRocket command is running. After an interrupted command, inspect .coderocket/command.lock before removing it.",
    );
  });
  try {
    await handle.writeFile(String(process.pid));
    return await run(args, root, env);
  } finally {
    await handle.close();
    await unlink(path);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href
)
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Command failed.");
    process.exitCode = 1;
  });
