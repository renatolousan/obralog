const RAW_BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:3000";

const BACKEND_BASE = RAW_BACKEND_BASE.endsWith("/")
  ? RAW_BACKEND_BASE
  : `${RAW_BACKEND_BASE}/`;

export function buildBackendUrl(path: string, searchParams?: URLSearchParams) {
  if (!path.startsWith("/")) {
    throw new Error(`Backend path deve comecar com '/': ${path}`);
  }

  const url = new URL(path, BACKEND_BASE);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  return url;
}

export async function fetchBackendJson(
  url: URL,
  init?: RequestInit,
  requestHeaders?: Headers
): Promise<{ response: Response; payload: unknown }>;
export async function fetchBackendJson(
  url: string,
  init?: RequestInit,
  requestHeaders?: Headers
): Promise<{ response: Response; payload: unknown }>;
export async function fetchBackendJson(
  url: URL | string,
  init?: RequestInit,
  requestHeaders?: Headers
): Promise<{ response: Response; payload: unknown }> {
  const headers = new Headers(init?.headers);

  // Repassa cookies e outros headers importantes do request original
  if (requestHeaders) {
    const cookie = requestHeaders.get("cookie");
    if (cookie) {
      headers.set("cookie", cookie);
    }

    // Repassa outros headers necessários para autenticação
    const authorization = requestHeaders.get("authorization");
    if (authorization) {
      headers.set("authorization", authorization);
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = (await response.json().catch(() => null)) ?? {};
  return { response, payload };
}
