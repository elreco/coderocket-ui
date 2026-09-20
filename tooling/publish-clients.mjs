import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

if (
  process.env.GITHUB_REPOSITORY !== "elreco/coderocket-ui" ||
  !process.env.GITHUB_REF_NAME?.startsWith("clients-v")
)
  throw new Error(
    "Automatic publishing requires the public repository's client release workflow.",
  );
const packages = JSON.parse(await readFile(".release/manifest.json", "utf8"));
if (packages.length !== 2)
  throw new Error("Expected both tested client archives.");
for (const item of packages) {
  if (!["@coderocketapp/cli", "@coderocketapp/mcp"].includes(item.name))
    throw new Error("Unexpected package.");
  if (!/^coderocketapp-(cli|mcp)-[0-9a-z.-]+\.tgz$/.test(item.filename))
    throw new Error("Invalid archive filename.");
  const bytes = await readFile(resolve(".release", item.filename));
  if (
    `sha512-${createHash("sha512").update(bytes).digest("base64")}` !==
    item.integrity
  )
    throw new Error("Package archive integrity mismatch.");
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(item.name)}/${item.version}`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (response.ok) {
    const existing = await response.json();
    if (existing.dist.integrity !== item.integrity)
      throw new Error(
        `${item.name}@${item.version} already exists with different contents. Bump the version.`,
      );
    console.log(
      `${item.name}@${item.version} already published; exact archive verified.`,
    );
    continue;
  }
  if (response.status !== 404)
    throw new Error(`Cannot verify registry state (${response.status}).`);
  execFileSync(
    "npm",
    [
      "publish",
      resolve(".release", item.filename),
      "--access",
      "public",
      "--provenance",
      "--ignore-scripts",
    ],
    { stdio: "inherit" },
  );
}
