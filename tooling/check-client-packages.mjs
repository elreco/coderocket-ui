import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const temp = await mkdtemp(resolve(tmpdir(), "coderocket-npm-smoke-"));
const packages = JSON.parse(
  await readFile(resolve(root, ".release/manifest.json"), "utf8"),
);
assert.equal(
  packages.length,
  2,
  "Build both clients before checking their packages.",
);
const library = randomUUID();
const token = `cr_${"a".repeat(43)}`;
let revision = 1;
let calls = 0;
const registry = createServer((request, response) => {
  calls++;
  if (request.headers.authorization !== `Bearer ${token}`) {
    response.writeHead(401).end();
    return;
  }
  const url = new URL(request.url, "http://localhost");
  response.setHeader("Content-Type", "application/json");
  if (url.pathname === `/r/${library}/snapshot.json`) {
    response.end(
      JSON.stringify({
        id: library,
        name: "Package smoke library",
        revision,
        model: {},
        rules: "Use the saved design tokens.",
        components: [
          {
            slug: "button",
            name: "Button",
            description: "Action",
            category: "form",
          },
        ],
        blocks: [],
        custom_components: [],
      }),
    );
  } else if (url.pathname === `/r/${library}/bundle.json`) {
    response.end(
      JSON.stringify({
        schemaVersion: 1,
        libraryId: library,
        revision,
        dependencies: {},
        files: {
          "styles/theme.css": `:root { --revision: ${revision}; }\n`,
          ...(url.searchParams.get("components")?.includes("button")
            ? {
                "components/ui/button.tsx": `export const Button = () => ${JSON.stringify(`revision-${revision}`)};\n`,
              }
            : {}),
        },
      }),
    );
  } else response.writeHead(404).end();
});
await new Promise((done) => registry.listen(0, "127.0.0.1", done));
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.startsWith("CODEROCKET_") && key !== "NODE_PATH",
  ),
);
const env = {
  ...cleanEnv,
  CODEROCKET_LIBRARY: library,
  CODEROCKET_TOKEN: token,
  CODEROCKET_SERVER: `http://127.0.0.1:${registry.address().port}`,
};
try {
  await writeFile(
    resolve(temp, "package.json"),
    '{"name":"coderocket-package-consumer","private":true,"type":"module"}\n',
  );
  await exec(
    "npm",
    [
      "install",
      "--offline",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--cache",
      resolve(temp, "npm-cache"),
      ...packages.map((item) => resolve(root, ".release", item.filename)),
    ],
    { cwd: temp, env: cleanEnv },
  );
  for (const item of packages) {
    const kind = item.name.split("/")[1];
    const directory = resolve(temp, "node_modules", item.name);
    const manifest = JSON.parse(
      await readFile(resolve(directory, "package.json"), "utf8"),
    );
    assert.equal(manifest.private, undefined);
    assert.equal(manifest.version, item.version);
    assert.equal(
      manifest.dependencies,
      undefined,
      "Clients must not depend on unpublished workspace packages.",
    );
    assert.deepEqual((await readdir(directory)).sort(), [
      "LICENSE",
      "README.md",
      "THIRD_PARTY_NOTICES.md",
      "dist",
      "package.json",
    ]);
    const bin = resolve(
      temp,
      "node_modules/.bin",
      kind === "cli" ? "coderocket" : "coderocket-mcp",
    );
    const help = await exec(bin, ["--help"], { cwd: temp, env: cleanEnv });
    assert.match(help.stdout, /CodeRocket/);
    const version = await exec(bin, ["--version"], {
      cwd: temp,
      env: cleanEnv,
    });
    assert.equal(version.stdout.trim(), item.version);
  }
  const cli = resolve(temp, "node_modules/.bin/coderocket");
  const run = (...args) => exec(cli, args, { cwd: temp, env });
  const before = calls;
  await assert.rejects(
    exec(cli, ["init"], { cwd: temp, env: cleanEnv }),
    (error) => error.code === 1 && /CODEROCKET_|Connect/.test(error.stderr),
  );
  assert.equal(
    calls,
    before,
    "Missing config must fail before contacting a registry.",
  );
  await run("init", library);
  assert.equal(
    JSON.parse(
      await readFile(resolve(temp, ".coderocket/manifest.json"), "utf8"),
    ).libraryId,
    library,
  );
  assert.match((await run("list", "components")).stdout, /button/);
  await run("add", "button");
  const installed = resolve(temp, "components/ui/button.tsx");
  assert.match(await readFile(installed, "utf8"), /revision-1/);
  revision = 2;
  await run("sync");
  assert.match(await readFile(installed, "utf8"), /revision-2/);
  await writeFile(installed, "// Local edits must survive\n");
  revision = 3;
  await assert.rejects(
    run("sync"),
    (error) => error.code === 2 && /Local edits preserved/.test(error.stdout),
  );
  assert.equal(
    await readFile(installed, "utf8"),
    "// Local edits must survive\n",
  );
  const mcp = spawn(resolve(temp, "node_modules/.bin/coderocket-mcp"), [], {
    cwd: temp,
    env,
    stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "";
  const pending = new Map();
  mcp.stdout.on("data", (chunk) => {
    buffer += chunk;
    while (buffer.includes("\n")) {
      const end = buffer.indexOf("\n");
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      try {
        const message = JSON.parse(line);
        pending.get(message.id)?.(message);
      } catch {
        /* Ignore empty transport lines. */
      }
    }
  });
  const request = (id, method, params) =>
    new Promise((done, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`MCP ${method} timed out.`));
      }, 10000);
      pending.set(id, (message) => {
        clearTimeout(timeout);
        pending.delete(id);
        message.error
          ? reject(new Error(JSON.stringify(message.error)))
          : done(message.result);
      });
      mcp.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
      );
    });
  try {
    const init = await request(1, "initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "package-smoke", version: "1.0.0" },
    });
    assert.equal(
      init.serverInfo.version,
      packages.find((item) => item.name.endsWith("/mcp")).version,
    );
    mcp.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        "\n",
    );
    const tools = await request(2, "tools/list", {});
    assert.ok(tools.tools.some((tool) => tool.name === "get_design_rules"));
    const rules = await request(3, "tools/call", {
      name: "get_design_rules",
      arguments: {},
    });
    assert.match(rules.content[0].text, /saved design tokens/);
  } finally {
    mcp.kill();
  }
  console.log(
    "Installed npm archives outside the workspace: CLI init/list/add/sync, local edit preservation and MCP handshake/tools passed.",
  );
} finally {
  await new Promise((done) => registry.close(done));
  await rm(temp, { recursive: true, force: true });
}
