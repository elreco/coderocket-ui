import { build } from "esbuild";
import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
export const clients = ["cli", "mcp"];

export async function buildClient(name) {
  if (!clients.includes(name)) throw new Error("Choose cli or mcp.");
  const directory = resolve(root, "packages", name);
  const source = JSON.parse(
    await readFile(resolve(directory, "package.json"), "utf8"),
  );
  if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(source.version))
    throw new Error("Invalid release version.");
  const output = resolve(directory, "dist/index.mjs");
  await mkdir(dirname(output), { recursive: true });
  const result = await build({
    entryPoints: [resolve(directory, "src/index.ts")],
    outfile: output,
    absWorkingDir: root,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node24",
    packages: "bundle",
    metafile: true,
    legalComments: "eof",
    define: { __CODEROCKET_VERSION__: JSON.stringify(source.version) },
    banner: {
      js: "import {createRequire as __crCreateRequire} from 'node:module'; const require = __crCreateRequire(import.meta.url);",
    },
  });
  await chmod(output, 0o755);
  const notices = new Map();
  for (const input of Object.keys(result.metafile.inputs)) {
    if (!input.includes("node_modules/")) continue;
    let current = dirname(resolve(root, input));
    while (current !== dirname(current)) {
      try {
        const manifest = JSON.parse(
          await readFile(resolve(current, "package.json"), "utf8"),
        );
        if (!manifest.name) {
          current = dirname(current);
          continue;
        }
        const key = `${manifest.name}@${manifest.version}`;
        if (!notices.has(key)) {
          const files = (await readdir(current))
            .filter((file) =>
              /^(?:licen[cs]e|copying|notice)(?:\.[a-z]+)?$/i.test(file),
            )
            .sort();
          const texts = await Promise.all(
            files.map((file) => readFile(resolve(current, file), "utf8")),
          );
          notices.set(
            key,
            `## ${key}\n\nLicense: ${manifest.license || "See package metadata"}\n\n${texts.join("\n\n")}`,
          );
        }
        break;
      } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
      }
      current = dirname(current);
    }
  }
  return {
    directory,
    version: source.version,
    notices: [...notices]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)
      .join("\n\n"),
  };
}

export async function packClient(name, outputRoot = resolve(root, ".release")) {
  const { directory, version, notices } = await buildClient(name);
  const stage = resolve(outputRoot, name);
  await rm(stage, { recursive: true, force: true });
  await mkdir(resolve(stage, "dist"), { recursive: true });
  for (const file of ["dist/index.mjs", "README.md", "LICENSE"])
    await copyFile(resolve(directory, file), resolve(stage, file));
  await writeFile(
    resolve(stage, "THIRD_PARTY_NOTICES.md"),
    `# Bundled dependencies\n\nThird-party code retains its original license.\n\n${notices || "This client bundles only CodeRocket source and uses Node.js built-ins."}\n`,
  );
  const manifest = {
    name: `@coderocketapp/${name}`,
    version,
    description:
      name === "cli"
        ? "Install and sync editable React and Vue components from your CodeRocket UI library."
        : "Give coding agents read-only access to your CodeRocket UI design system, components and blocks through MCP.",
    type: "module",
    license: "MIT",
    engines: { node: ">=24" },
    bin: {
      [name === "cli" ? "coderocket" : "coderocket-mcp"]: "dist/index.mjs",
    },
    files: ["dist/index.mjs", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"],
    repository: {
      type: "git",
      url: "git+https://github.com/elreco/coderocket-ui.git",
      directory: `packages/${name}`,
    },
    bugs: { url: "https://github.com/elreco/coderocket-ui/issues" },
    homepage: "https://ui.coderocket.app/docs/agents",
    keywords: [
      "coderocket",
      "react",
      "vue",
      "components",
      "design-system",
      name === "mcp" ? "model-context-protocol" : "cli",
    ],
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
  };
  await writeFile(
    resolve(stage, "package.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  const [packed] = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--json",
        "--ignore-scripts",
        "--cache",
        resolve(outputRoot, ".npm-cache"),
        "--pack-destination",
        outputRoot,
      ],
      { cwd: stage, encoding: "utf8" },
    ),
  );
  const allowed = new Set([
    "package.json",
    "dist/index.mjs",
    "README.md",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
  ]);
  if (
    packed.files.some(({ path }) => !allowed.has(path)) ||
    packed.files.length !== allowed.size
  )
    throw new Error("Unexpected files in client package.");
  const metadata = {
    name: manifest.name,
    version,
    filename: packed.filename,
    integrity: packed.integrity,
    size: packed.size,
  };
  console.log(
    `${manifest.name}@${version}: ${packed.entryCount} files, ${packed.size} bytes`,
  );
  return metadata;
}

async function main() {
  const selected = process.argv.slice(2);
  const names = selected.length ? selected : clients;
  if (names.some((name) => !clients.includes(name)))
    throw new Error("Usage: node tooling/client-release.mjs [cli|mcp]");
  const output = resolve(root, ".release");
  await mkdir(output, { recursive: true });
  const packages = [];
  for (const name of names) packages.push(await packClient(name, output));
  await writeFile(
    resolve(output, "manifest.json"),
    JSON.stringify(packages, null, 2) + "\n",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await main();
