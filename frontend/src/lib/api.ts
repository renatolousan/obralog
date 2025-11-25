const frontendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function ensureAbsolute(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`Path deve comecar com '/': ${path}`);
  }
}

export function buildApiUrl(path: string): string {
  ensureAbsolute(path);

  if (!frontendBaseUrl) {
    return path;
  }

  return `${frontendBaseUrl}${path}`;
}

export function buildBackendUrl(path: string): string {
  ensureAbsolute(path);
  return `${backendBaseUrl}${path}`;
}
