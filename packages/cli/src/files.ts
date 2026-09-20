import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  readFile,
  mkdir,
  writeFile,
  rename,
  open,
  unlink,
} from "node:fs/promises";
import { resolve, relative, dirname, sep } from "node:path";

export type Lock = {
  schemaVersion: 1;
  revision: number;
  files: Record<string, { hash: string; revision: number }>;
};
export const hash = (content: string) =>
  createHash("sha256").update(content).digest("hex");
export function allowedExportPath(path: string) {
  return /^(components\/(ui|blocks)\/[a-z][a-z0-9-]*\.(?:tsx?|vue)|styles\/[a-z][a-z0-9-]*\.css|\.coderocket\/(README\.md|LICENSE|AGENTS\.md)|design-system\.json|AGENTS\.md|README\.md|LICENSE)$/.test(
    path,
  );
}

export async function safePath(root: string, path: string) {
  if (
    !path ||
    path.includes("\\") ||
    path.split("/").some((part) => part === ".." || part === "." || !part)
  )
    throw new Error("Unsafe installation path.");
  const base = resolve(root),
    target = resolve(base, path),
    rel = relative(base, target);
  if (rel.startsWith(".." + sep) || rel === ".." || target === base)
    throw new Error("Path escapes the project.");
  let current = base;
  for (const part of ["", ...rel.split(sep)]) {
    current = part ? resolve(current, part) : current;
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink())
        throw new Error("Refusing to write through a symbolic link.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return target;
}
export async function readOptional(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
export async function atomicWrite(root: string, path: string, content: string) {
  const target = await safePath(root, path);
  await mkdir(dirname(target), { recursive: true });
  const temporary = target + "." + randomUUID() + ".tmp";
  try {
    await writeFile(temporary, content, { flag: "wx", mode: 0o600 });
    await rename(temporary, target);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

/** Checks the entire update before changing any installed file. Conflicts never advance the lock. */
export async function installFiles(
  root: string,
  files: Record<string, string>,
  revision: number,
  previous?: Lock,
) {
  const lockDir = await safePath(root, ".coderocket");
  await mkdir(lockDir, { recursive: true });
  const busyPath = await safePath(root, ".coderocket/install.lock");
  const busy = await open(busyPath, "wx").catch(() => {
    throw new Error(
      "Another install is running. If it was interrupted, review .coderocket/install.lock before removing it.",
    );
  });
  try {
    const entries = Object.entries(files);
    if (entries.length > 500)
      throw new Error("The bundle contains too many files.");
    const states: Record<string, string | undefined> = {};
    const conflicts: string[] = [];
    for (const [path, content] of entries) {
      if (
        !allowedExportPath(path) ||
        typeof content !== "string" ||
        content.length > 2_000_000
      )
        throw new Error("The bundle contains an unsupported file.");
      const current = await readOptional(await safePath(root, path));
      states[path] = current;
      const baseline = previous?.files[path]?.hash;
      if (
        current !== undefined &&
        current !== content &&
        (!baseline || hash(current) !== baseline)
      )
        conflicts.push(path);
      if (current === undefined && baseline) conflicts.push(path); // A local deletion is also a deliberate edit.
    }
    if (conflicts.length) {
      const reviewDir = `.coderocket/review-${randomUUID()}`;
      for (const path of conflicts) {
        await atomicWrite(root, `${reviewDir}/incoming/${path}`, files[path]);
        if (states[path] !== undefined)
          await atomicWrite(
            root,
            `${reviewDir}/current/${path}`,
            states[path]!,
          );
      }
      await atomicWrite(
        root,
        `${reviewDir}/README.md`,
        "# Local changes preserved\n\nCompare current/ and incoming/. Nothing in your installed source or lock was changed. Merge the files in your editor and keep the versions you intend to own; CodeRocket never assumes a merge is safe.\n",
      );
      await atomicWrite(
        root,
        `${reviewDir}/changes.json`,
        JSON.stringify({ revision, conflicts }, null, 2) + "\n",
      );
      return { applied: false as const, conflicts, reviewDir };
    }
    // Catch edits made while the bundle was being checked, before applying any part of it.
    for (const [path] of entries)
      if ((await readOptional(await safePath(root, path))) !== states[path])
        throw new Error(
          "A local file changed during installation. Run the command again.",
        );
    const next: Lock = {
      schemaVersion: 1,
      revision,
      files: { ...previous?.files },
    };
    for (const [path, content] of entries) {
      if (states[path] !== content) await atomicWrite(root, path, content);
      next.files[path] = { hash: hash(content), revision };
    }
    await atomicWrite(
      root,
      ".coderocket/lock.json",
      JSON.stringify(next, null, 2) + "\n",
    );
    return { applied: true as const, conflicts: [], lock: next };
  } finally {
    await busy.close();
    await unlink(busyPath);
  }
}
