import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  symlink,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it, expect } from "vitest";
import { installFiles } from "./files";

it("updates pristine files, preserves local edits and deletions, and keeps the prior lock on conflicts", async () => {
  const root = await mkdtemp(join(tmpdir(), "coderocket-install-"));
  try {
    const initial = await installFiles(
      root,
      { "components/ui/button.tsx": "v1", "styles/theme.css": "theme1" },
      1,
    );
    if (!initial.applied) throw new Error("Expected install");
    const update = await installFiles(
      root,
      { "components/ui/button.tsx": "v2", "styles/theme.css": "theme2" },
      2,
      initial.lock,
    );
    if (!update.applied) throw new Error("Expected update");
    await writeFile(join(root, "components/ui/button.tsx"), "my edit");
    const conflict = await installFiles(
      root,
      { "components/ui/button.tsx": "v3", "styles/theme.css": "theme3" },
      3,
      update.lock,
    );
    expect(conflict.applied).toBe(false);
    expect(await readFile(join(root, "components/ui/button.tsx"), "utf8")).toBe(
      "my edit",
    );
    expect(await readFile(join(root, "styles/theme.css"), "utf8")).toBe(
      "theme2",
    );
    expect(
      JSON.parse(await readFile(join(root, ".coderocket/lock.json"), "utf8"))
        .revision,
    ).toBe(2);
    await rm(join(root, "components/ui/button.tsx"));
    expect(
      (
        await installFiles(
          root,
          { "components/ui/button.tsx": "v3" },
          3,
          update.lock,
        )
      ).applied,
    ).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
it("protects existing files on first install and rejects traversal and symlinks", async () => {
  const root = await mkdtemp(join(tmpdir(), "coderocket-paths-")),
    outside = await mkdtemp(join(tmpdir(), "coderocket-outside-"));
  try {
    await writeFile(join(root, "AGENTS.md"), "my existing instructions");
    expect(
      (await installFiles(root, { "AGENTS.md": "incoming" }, 1)).applied,
    ).toBe(false);
    await expect(
      installFiles(root, { "../escape.tsx": "bad" }, 1),
    ).rejects.toThrow("unsupported");
    await mkdir(join(root, "components"));
    await symlink(outside, join(root, "components/ui"));
    await expect(
      installFiles(root, { "components/ui/button.tsx": "bad" }, 1),
    ).rejects.toThrow("symbolic");
    expect(await readFile(join(root, "AGENTS.md"), "utf8")).toBe(
      "my existing instructions",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

it("installs native Vue components, blocks and TypeScript helpers without widening the file allowlist", async () => {
  const root = await mkdtemp(join(tmpdir(), "coderocket-vue-install-"));
  try {
    const files = {
      "components/ui/button.vue":
        '<script setup lang="ts">defineProps<{ disabled?: boolean }>();</script>\n<template><button :disabled="disabled"><slot /></button></template>\n',
      "components/blocks/pricing.vue":
        '<script setup lang="ts">import Button from "../ui/button.vue";</script>\n<template><section><Button>Choose plan</Button></section></template>\n',
      "components/ui/utils.ts":
        'export const cx = (...values: string[]) => values.join(" ");\n',
      "components/ui/index.ts":
        'export { default as Button } from "./button.vue";\n',
      "styles/components.css": ".cr-button { display: inline-flex; }\n",
    };
    const result = await installFiles(root, files, 1);
    expect(result.applied).toBe(true);
    if (!result.applied) throw new Error("Expected Vue install");
    expect(Object.keys(result.lock.files).sort()).toEqual(
      Object.keys(files).sort(),
    );
    for (const [path, source] of Object.entries(files)) {
      expect(await readFile(join(root, path), "utf8")).toBe(source);
    }
    for (const path of [
      "components/ui/../outside.vue",
      "components/ui/../../escape.vue",
      "components/ui\\button.vue",
      "/components/ui/button.vue",
      "components/ui/nested/button.vue",
      "components/ui/button.vue.js",
      "components/ui/button.VUE",
      "plugins/server.vue",
      "nuxt.config.ts",
      "package.json",
    ]) {
      await expect(
        installFiles(root, { [path]: "unsafe" }, 2, result.lock),
      ).rejects.toThrow("unsupported");
    }
    expect(
      JSON.parse(await readFile(join(root, ".coderocket/lock.json"), "utf8"))
        .revision,
    ).toBe(1);
    expect(await readFile(join(root, "components/ui/button.vue"), "utf8")).toBe(
      files["components/ui/button.vue"],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("syncs pristine Vue source but preserves edited and deleted SFCs with review copies", async () => {
  const root = await mkdtemp(join(tmpdir(), "coderocket-vue-sync-"));
  try {
    const button = "components/ui/button.vue";
    const block = "components/blocks/pricing.vue";
    const first = await installFiles(
      root,
      {
        [button]: "<template><button>Original</button></template>",
        [block]: "<template><section>Pricing</section></template>",
        "styles/theme.css": "theme1",
      },
      1,
    );
    if (!first.applied) throw new Error("Expected Vue install");
    const next = {
      [button]: "<template><button>Updated</button></template>",
      [block]: "<template><section>New pricing</section></template>",
      "styles/theme.css": "theme2",
    };
    const second = await installFiles(root, next, 2, first.lock);
    if (!second.applied) throw new Error("Expected Vue sync");
    expect(await readFile(join(root, button), "utf8")).toBe(next[button]);
    const local =
      '<template><button @click="save">My product action</button></template>';
    await writeFile(join(root, button), local);
    await rm(join(root, block));
    const incoming = {
      ...next,
      [button]: "<template><button>New upstream version</button></template>",
      "styles/theme.css": "theme3",
    };
    const conflict = await installFiles(root, incoming, 3, second.lock);
    expect(conflict.applied).toBe(false);
    if (conflict.applied) throw new Error("Expected Vue conflict");
    expect(conflict.conflicts).toEqual([button, block]);
    expect(await readFile(join(root, button), "utf8")).toBe(local);
    await expect(readFile(join(root, block), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(await readFile(join(root, "styles/theme.css"), "utf8")).toBe(
      "theme2",
    );
    expect(
      await readFile(join(root, conflict.reviewDir, "current", button), "utf8"),
    ).toBe(local);
    expect(
      await readFile(
        join(root, conflict.reviewDir, "incoming", button),
        "utf8",
      ),
    ).toBe(incoming[button]);
    expect(
      await readFile(join(root, conflict.reviewDir, "incoming", block), "utf8"),
    ).toBe(incoming[block]);
    expect(
      JSON.parse(await readFile(join(root, ".coderocket/lock.json"), "utf8")),
    ).toEqual(second.lock);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("refuses Vue SFC writes through both directory and file symlinks", async () => {
  const root = await mkdtemp(join(tmpdir(), "coderocket-vue-paths-"));
  const outside = await mkdtemp(join(tmpdir(), "coderocket-vue-outside-"));
  try {
    await mkdir(join(root, "components"));
    await symlink(outside, join(root, "components/ui"));
    await expect(
      installFiles(root, { "components/ui/button.vue": "incoming" }, 1),
    ).rejects.toThrow("symbolic");
    await rm(join(root, "components/ui"));
    await mkdir(join(root, "components/ui"));
    const target = join(outside, "original.vue");
    await writeFile(target, "private original");
    await symlink(target, join(root, "components/ui/button.vue"));
    await expect(
      installFiles(root, { "components/ui/button.vue": "incoming" }, 1),
    ).rejects.toThrow("symbolic");
    expect(await readFile(target, "utf8")).toBe("private original");
    await expect(
      readFile(join(outside, "button.vue"), "utf8"),
    ).rejects.toMatchObject({ code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
