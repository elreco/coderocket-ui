import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ["vue"],
    alias: ["engine", "specs", "shared", "react", "blocks"].flatMap((name) => [
      {
        find: new RegExp(`^@coderocket/${name}$`),
        replacement: fileURLToPath(
          new URL(`./packages/${name}/src/index.ts`, import.meta.url),
        ),
      },
      {
        find: new RegExp(`^@coderocket/${name}/`),
        replacement: fileURLToPath(
          new URL(`./packages/${name}/src/`, import.meta.url),
        ),
      },
    ]),
  },
  test: {
    include: ["packages/**/*.test.ts"],
    testTimeout: 30000,
  },
});
