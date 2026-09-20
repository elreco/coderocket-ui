import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToString as renderReact } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "@vue/server-renderer";

const root = fileURLToPath(new URL("../", import.meta.url));
const names = [
  "engine",
  "specs",
  "shared",
  "react",
  "blocks",
  "cli",
  "mcp",
  "vue",
];
for (const name of names) {
  const directory = resolve(root, "packages", name);
  const manifest = JSON.parse(
    await readFile(resolve(directory, "package.json"), "utf8"),
  );
  for (const value of Object.values(manifest.exports)) {
    for (const path of typeof value === "string"
      ? [value]
      : [value.types, value.import]) {
      assert(path?.startsWith("./dist/"), `${name} must export built files`);
      await access(resolve(directory, path));
    }
  }
}
for (const name of ["react", "blocks", "vue"]) {
  const css = await readFile(
    resolve(root, "packages", name, "dist/styles.css"),
    "utf8",
  );
  assert(!/@import\s/.test(css), `${name} styles must be standalone`);
  assert(css.length > 1000, `${name} styles must not be empty`);
}
const vueCss = await readFile(
  resolve(root, "packages/vue/dist/styles.css"),
  "utf8",
);
for (const selector of [
  ".cr-button",
  ".cr-calendar",
  ".cr-block",
  ".cr-date-picker-popup.cr-popup[data-v-",
]) {
  assert(vueCss.includes(selector), `Vue styles missing ${selector}`);
}
const load = (path) => import(pathToFileURL(resolve(root, path)).href);
const react = await load("packages/react/dist/index.js");
const vue = await load("packages/vue/dist/index.js");
const vueBlocks = await load("packages/vue/dist/blocks/index.js");
const engine = await load("packages/engine/dist/index.js");
assert(
  renderReact(
    createElement(
      react.ThemeScope,
      null,
      createElement(react.Button, null, "Standalone React"),
    ),
  ).includes("Standalone React"),
);
const vueMarkup = await renderVue(
  createSSRApp({
    render: () =>
      h(vue.ThemeScope, null, {
        default: () => h(vue.Button, null, { default: () => "Standalone Vue" }),
      }),
  }),
);
assert(vueMarkup.includes("Standalone Vue"));
assert(
  vueBlocks.LoginBlock && vueBlocks.FeaturesBlock,
  "Vue block exports are available",
);
assert(
  engine
    .generateCSS(engine.createDesignSystem("Offline", "light", "vue"))
    .includes("--cr-primary"),
);

// Resolve only the built package exports from a separate consumer, with no Studio.
const consumer = resolve(root, ".build/consumer");
await rm(consumer, { recursive: true, force: true });
await mkdir(resolve(consumer, "node_modules/@coderocket"), { recursive: true });
for (const name of names)
  await symlink(
    resolve(root, "packages", name),
    resolve(consumer, "node_modules/@coderocket", name),
    "dir",
  );
await writeFile(
  resolve(consumer, "index.ts"),
  `
import { Button as ReactButton, Calendar as ReactCalendar } from "@coderocket/react";
import { Button as VueButton, Calendar as VueCalendar } from "@coderocket/vue";
import { LoginBlock, FeaturesBlock } from "@coderocket/vue/blocks";
import CompositionPreview from "@coderocket/vue/composition";
import { createDesignSystem, generateCSS } from "@coderocket/engine";
const components = [ReactButton, ReactCalendar, VueButton, VueCalendar, LoginBlock, FeaturesBlock, CompositionPreview];
const styles: string = generateCSS(createDesignSystem("Standalone", "light", "vue"));
void components; void styles;
`,
);
await writeFile(
  resolve(consumer, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: [],
        lib: ["ES2022", "DOM", "DOM.Iterable"],
      },
      include: ["index.ts"],
    },
    null,
    2,
  ),
);
execFileSync(
  process.execPath,
  [
    resolve(root, "node_modules/typescript/bin/tsc6"),
    "-p",
    resolve(consumer, "tsconfig.json"),
  ],
  { cwd: root, stdio: "inherit" },
);
console.log(
  "Distribution smoke passed: React/Vue SSR, all export paths, standalone CSS and consumer types; no account or backend.",
);
