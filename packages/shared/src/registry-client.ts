export const DEFAULT_SERVER = "https://ui.coderocket.app";
export type Bundle = {
  schemaVersion: 1;
  libraryId: string;
  revision: number;
  files: Record<string, string>;
  dependencies: Record<string, string>;
};
export type Snapshot = {
  id: string;
  name: string;
  revision: number;
  model: unknown;
  rules: string;
  components: {
    slug: string;
    name: string;
    description: string;
    category: string;
  }[];
  blocks: {
    slug: string;
    name: string;
    description: string;
    category: string;
  }[];
  custom_components: unknown[];
};

export function serverOrigin(value: string) {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "Use the server origin only, without credentials or a path.",
    );
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
  )
    throw new Error("Connections require HTTPS.");
  return url.origin;
}
export async function registryRequest<T>(
  server: string,
  libraryId: string,
  item: string,
  token: string,
) {
  if (
    !/^[0-9a-f-]{36}$/i.test(libraryId) ||
    !/^cr_[A-Za-z0-9_-]{43}$/.test(token)
  )
    throw new Error(
      "Set CODEROCKET_LIBRARY and CODEROCKET_TOKEN from the Studio connection panel.",
    );
  const origin = serverOrigin(server);
  const url = new URL(`/r/${libraryId}/${item}`, origin);
  if (url.origin !== origin) throw new Error("Invalid registry URL.");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Connection expired or revoked. Create a new token in the Studio."
        : `Registry unavailable (${response.status}). No project files were changed.`,
    );
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty registry response.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 8_000_000) {
      await reader.cancel();
      throw new Error("Registry response is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
