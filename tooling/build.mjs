import { build } from "esbuild";
import { build as buildVite } from "vite";
import vue from "@vitejs/plugin-vue";
import { cp, mkdir, readFile, rm, chmod } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const entries = {
  engine: ["index", "import"],
  specs: ["index", "composition"],
  shared: ["index", "registry-client"],
  react: ["index", "showcase", "composition"],
  blocks: ["index", "showcase"],
  cli: ["index"],
  mcp: ["index"],
};

await rm(resolve(root, ".build/types"), { recursive: true, force: true });
execFileSync(
  process.execPath,
  [
    resolve(root, "node_modules/typescript/bin/tsc6"),
    "-p",
    "tsconfig.build.json",
  ],
  { cwd: root, stdio: "inherit" },
);

for (const [name, names] of Object.entries(entries)) {
  const directory = resolve(root, "packages", name);
  const manifest = JSON.parse(
    await readFile(resolve(directory, "package.json"), "utf8"),
  );
  const executable = name === "cli" || name === "mcp";
  const entryPoints = Object.fromEntries(
    names.map((entry) => {
      const file =
        manifest.exports[entry === "index" ? "." : `./${entry}`].source;
      return [entry, resolve(directory, file)];
    }),
  );
  await rm(resolve(directory, "dist"), { recursive: true, force: true });
  await mkdir(resolve(directory, "dist"), { recursive: true });
  await build({
    entryPoints,
    outdir: resolve(directory, "dist"),
    bundle: true,
    platform: executable ? "node" : "neutral",
    format: "esm",
    target: executable ? "node24" : "es2022",
    packages: "external",
    tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } },
    legalComments: "eof",
    outExtension: executable ? { ".js": ".mjs" } : undefined,
    banner:
      name === "react" || name === "blocks"
        ? { js: '"use client";' }
        : undefined,
    logLevel: "warning",
  });
  await cp(
    resolve(root, ".build/types/packages", name, "src"),
    resolve(directory, "dist"),
    {
      recursive: true,
    },
  );
  if (name === "react" || name === "blocks") {
    await build({
      entryPoints: [resolve(directory, "src/styles.css")],
      outfile: resolve(directory, "dist/styles.css"),
      bundle: true,
      logLevel: "warning",
    });
  }
  if (executable) await chmod(resolve(directory, "dist/index.mjs"), 0o755);
  console.log(`Built ${manifest.name}`);
}

// Vue is compiled to portable ESM; consumers do not need a Vue SFC plugin.
const vueDirectory = resolve(root, "packages/vue");
await rm(resolve(vueDirectory, "dist"), { recursive: true, force: true });
await rm(resolve(root, ".build/vue-types"), { recursive: true, force: true });
await buildVite({
  configFile: false,
  plugins: [vue()],
  build: {
    outDir: resolve(vueDirectory, "dist"),
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(vueDirectory, "src/index.ts"),
        "blocks/index": resolve(vueDirectory, "src/blocks/index.ts"),
        composition: resolve(vueDirectory, "src/composition.vue"),
      },
      formats: ["es"],
      cssFileName: "components",
    },
    rolldownOptions: {
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("\0"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
execFileSync(
  process.execPath,
  [
    resolve(root, "node_modules/vue-tsc/bin/vue-tsc.js"),
    "-p",
    "packages/vue/tsconfig.build.json",
  ],
  { cwd: root, stdio: "inherit" },
);
await cp(
  resolve(root, ".build/vue-types/packages/vue/src"),
  resolve(vueDirectory, "dist"),
  { recursive: true },
);
await build({
  stdin: {
    contents:
      '@import "./packages/vue/src/styles.css";\n@import "./packages/blocks/src/styles.css";\n@import "./packages/vue/dist/components.css";',
    resolveDir: root,
    sourcefile: "vue-styles.css",
    loader: "css",
  },
  outfile: resolve(vueDirectory, "dist/styles.css"),
  bundle: true,
  logLevel: "warning",
});
console.log("Built @coderocket/vue");
