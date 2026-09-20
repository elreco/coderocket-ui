import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { main, VERSION } from "./index";

const libraryId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const token = "cr_" + "x".repeat(43);
const origin = "https://ui.coderocket.app";
const snapshot = {
  id: libraryId,
  name: "Test library",
  revision: 1,
  components: [{ slug: "button", name: "Button" }],
  blocks: [{ slug: "login", name: "Login" }],
};
const bundle = {
  schemaVersion: 1,
  libraryId,
  revision: 1,
  files: { "styles/theme.css": ":root { --color: blue; }" },
  dependencies: {},
};
let root: string;
let previousExitCode: typeof process.exitCode;
const fetchMock = vi.fn<typeof fetch>();

beforeEach(async () => {
  previousExitCode = process.exitCode;
  root = await mkdtemp(join(tmpdir(), "coderocket-cli-"));
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input) =>
    Response.json(String(input).includes("snapshot.json") ? snapshot : bundle),
  );
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  process.exitCode = previousExitCode;
  await rm(root, { recursive: true, force: true });
});
function output() {
  return vi.mocked(console.log).mock.calls.flat().join("\n");
}
async function connect() {
  await mkdir(join(root, ".coderocket"));
  await writeFile(
    join(root, ".coderocket/manifest.json"),
    JSON.stringify({
      schemaVersion: 1,
      server: origin,
      libraryId,
      components: [],
      blocks: [],
      revision: 1,
    }),
  );
}

describe("CLI setup", () => {
  it.each(
    [[], ["--help"], ["init", "--help"], ["--version"], ["-v"]].map((args) => ({
      args,
    })),
  )(
    "prints metadata without credentials, network requests or project writes: $args",
    async ({ args }) => {
      await main(args, root, { CODEROCKET_SERVER: "invalid" });
      expect(output()).toContain(VERSION);
      if (!args.includes("--version") && !args.includes("-v")) {
        expect(output()).toContain("npx @coderocketapp/cli@latest");
        expect(output()).toContain("read -rs CODEROCKET_TOKEN");
      }
      expect(fetchMock).not.toHaveBeenCalled();
      expect(await readdir(root)).toEqual([]);
    },
  );

  it.each(
    [
      ["init", libraryId, "--token", token],
      ["init", libraryId, token],
      ["add"],
      ["add", "--all", "button"],
      ["list", "unknown"],
      ["sync", "unexpected"],
    ].map((args) => ({ args })),
  )(
    "rejects incorrect arguments before any project writes: $args",
    async ({ args }) => {
      await expect(main(args, root, {})).rejects.toThrow();
      expect(await readdir(root)).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each(["add", "sync"])(
    "explains missing project setup for %s",
    async (command) => {
      await expect(
        main(command === "add" ? [command, "button"] : [command], root, {
          CODEROCKET_TOKEN: token,
        }),
      ).rejects.toThrow("Run coderocket init <library-id> first");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("explains missing library and token configuration before network access", async () => {
    await expect(main(["init"], root, {})).rejects.toThrow("valid library ID");
    await expect(main(["init", libraryId], root, {})).rejects.toThrow(
      "CODEROCKET_TOKEN",
    );
    await expect(main(["list"], root, {})).rejects.toThrow("valid library ID");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "initializes using a positional ID or the existing environment variable (%s)",
    async (positional) => {
      await main(positional ? ["init", libraryId] : ["init"], root, {
        CODEROCKET_LIBRARY: positional ? otherId : libraryId,
        CODEROCKET_TOKEN: token,
      });
      const manifest = await readFile(
        join(root, ".coderocket/manifest.json"),
        "utf8",
      );
      expect(JSON.parse(manifest)).toMatchObject({ libraryId, revision: 1 });
      expect(manifest).not.toContain(token);
      expect(await readFile(join(root, "styles/theme.css"), "utf8")).toBe(
        bundle.files["styles/theme.css"],
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(String(fetchMock.mock.calls[0][0])).toBe(
        `${origin}/r/${libraryId}/snapshot.json`,
      );
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
        Authorization: `Bearer ${token}`,
      });
      expect(output()).not.toContain(token);
    },
  );
});

describe("CLI catalogue", () => {
  it("lists installable component and block slugs without initializing or downloading source", async () => {
    await main(["list"], root, {
      CODEROCKET_LIBRARY: libraryId,
      CODEROCKET_TOKEN: token,
    });
    expect(output()).toContain("Components (1)\n  button  Button");
    expect(output()).toContain("Blocks (1)\n  block-login  Login");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await readdir(root)).toEqual([]);
  });

  it.each(["components", "blocks"])(
    "filters %s using the connected project's library",
    async (kind) => {
      await connect();
      const before = await readFile(
        join(root, ".coderocket/manifest.json"),
        "utf8",
      );
      await main(["list", kind], root, {
        CODEROCKET_LIBRARY: otherId,
        CODEROCKET_TOKEN: token,
      });
      expect(output()).toContain(
        kind === "components" ? "button  Button" : "block-login  Login",
      );
      expect(output()).not.toContain(
        kind === "components" ? "block-login" : "button  Button",
      );
      expect(String(fetchMock.mock.calls[0][0])).toBe(
        `${origin}/r/${libraryId}/snapshot.json`,
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(await readdir(join(root, ".coderocket"))).toEqual([
        "manifest.json",
      ]);
      expect(
        await readFile(join(root, ".coderocket/manifest.json"), "utf8"),
      ).toBe(before);
    },
  );

  it.each(["list", "sync"])(
    "does not send credentials to a different server for %s",
    async (command) => {
      await connect();
      await expect(
        main([command], root, {
          CODEROCKET_SERVER: "https://other.example",
          CODEROCKET_TOKEN: token,
        }),
      ).rejects.toThrow("different server");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});

it("preserves edited files and the installed manifest when sync needs review", async () => {
  await main(["init", libraryId], root, { CODEROCKET_TOKEN: token });
  await writeFile(join(root, "styles/theme.css"), "local theme");
  fetchMock.mockImplementation(async (input) =>
    Response.json(
      String(input).includes("snapshot.json")
        ? { ...snapshot, revision: 2 }
        : {
            ...bundle,
            revision: 2,
            files: { "styles/theme.css": "upstream theme" },
          },
    ),
  );
  await main(["sync"], root, { CODEROCKET_TOKEN: token });
  expect(await readFile(join(root, "styles/theme.css"), "utf8")).toBe(
    "local theme",
  );
  expect(
    JSON.parse(await readFile(join(root, ".coderocket/manifest.json"), "utf8"))
      .revision,
  ).toBe(1);
  expect(process.exitCode).toBe(2);
  expect(output()).toContain("Local edits preserved");
});
