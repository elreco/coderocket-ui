import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer, main, VERSION } from "./index";

const env = {
  CODEROCKET_LIBRARY: "11111111-1111-4111-8111-111111111111",
  CODEROCKET_TOKEN: "cr_" + "x".repeat(43),
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MCP command entry point", () => {
  it.each(["--help", "-h", "help", "--version", "-v"])(
    "%s does not start stdio, require configuration or access the registry",
    async (argument) => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const connect = vi.spyOn(McpServer.prototype, "connect");
      const start = vi.spyOn(StdioServerTransport.prototype, "start");
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      await main([argument], { CODEROCKET_SERVER: "invalid" });
      expect(log.mock.calls.flat().join("\n")).toContain(VERSION);
      expect(connect).not.toHaveBeenCalled();
      expect(start).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("explains npm client configuration in help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await main(["--help"], {});
    const output = log.mock.calls.flat().join("\n");
    expect(output).toContain("@coderocketapp/mcp@latest");
    expect(output).toContain("CODEROCKET_LIBRARY and CODEROCKET_TOKEN");
    expect(output).toContain("list_components, list_blocks");
  });

  it("rejects missing configuration and unexpected arguments before connecting", async () => {
    const connect = vi.spyOn(McpServer.prototype, "connect");
    await expect(main([], {})).rejects.toThrow("MCP client's environment");
    await expect(main(["--token", env.CODEROCKET_TOKEN], env)).rejects.toThrow(
      "never command arguments",
    );
    expect(connect).not.toHaveBeenCalled();
  });

  it.each([[], ["--stdio"]].map((args) => ({ args })))(
    "starts stdio with the existing environment configuration: $args",
    async ({ args }) => {
      const connect = vi
        .spyOn(McpServer.prototype, "connect")
        .mockResolvedValue();
      await main(args, env);
      expect(connect).toHaveBeenCalledExactlyOnceWith(
        expect.any(StdioServerTransport),
      );
    },
  );
});

it("advertises the package version and keeps catalogue tools authenticated and read-only", async () => {
  const components = [
    {
      slug: "button",
      name: "Button",
      category: "Inputs",
      description: "A button",
    },
  ];
  const fetchMock = vi
    .fn()
    .mockImplementation(async () => Response.json({ components }));
  vi.stubGlobal("fetch", fetchMock);
  const server = createServer(env);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    expect(client.getServerVersion()).toEqual({
      name: "coderocket",
      version: VERSION,
    });
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(8);
    expect(tools.every((tool) => tool.annotations?.readOnlyHint === true)).toBe(
      true,
    );
    const result = await client.callTool({
      name: "list_components",
      arguments: {},
    });
    expect(result.content).toEqual([
      { type: "text", text: JSON.stringify(components, null, 2) },
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      new URL(
        `https://ui.coderocket.app/r/${env.CODEROCKET_LIBRARY}/snapshot.json`,
      ),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${env.CODEROCKET_TOKEN}` },
      }),
    );
  } finally {
    await client.close();
    await server.close();
  }
});
