import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const roots = [
  ...["react", "vue", "blocks", "engine", "specs", "shared", "cli", "mcp"].map(
    (name) => `packages/${name}/src`,
  ),
  "packages/vue/preview",
  "docs/content",
];
async function collect(directory) {
  const files = {};
  for (const entry of (
    await readdir(resolve(root, directory), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) Object.assign(files, await collect(path));
    else if (entry.isFile())
      files[path] = createHash("sha256")
        .update(await readFile(resolve(root, path)))
        .digest("hex");
    else throw new Error(`Unsupported public source: ${path}`);
  }
  return files;
}
const files = Object.assign({}, ...(await Promise.all(roots.map(collect))));
if (process.argv.includes("--write")) {
  await writeFile(
    resolve(root, ".coderocket/source-manifest.json"),
    `${JSON.stringify({ schemaVersion: 1, files }, null, 2)}\n`,
  );
  console.log(
    `Refreshed ${Object.keys(files).length} public source hashes. Review and commit the manifest with your changes.`,
  );
  process.exit(0);
}
const manifest = JSON.parse(
  await readFile(resolve(root, ".coderocket/source-manifest.json"), "utf8"),
);
if (manifest.schemaVersion !== 1 || !Object.keys(manifest.files ?? {}).length)
  throw new Error("Missing public source manifest.");

for (const [path, expected] of Object.entries(manifest.files)) {
  if (
    !/^(?:packages\/(?:react|vue|blocks|engine|specs|shared|cli|mcp)\/(?:src|preview)\/|docs\/content\/)/.test(
      path,
    ) ||
    path.includes("..")
  )
    throw new Error(`Unexpected source path: ${path}`);
  if (files[path] !== expected)
    throw new Error(
      `Source manifest is stale: ${path}. Run node tooling/check-source-manifest.mjs --write and review the result.`,
    );
}
if (Object.keys(files).length !== Object.keys(manifest.files).length)
  throw new Error(
    "New public sources are missing from the manifest. Run node tooling/check-source-manifest.mjs --write.",
  );
console.log(
  `Verified ${Object.keys(manifest.files).length} public component and documentation sources.`,
);
