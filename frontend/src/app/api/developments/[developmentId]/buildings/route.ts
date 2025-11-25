import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

function extractSegment(pathname: string, marker: string): string | null {
  const segments = pathname.split("/");
  const index = segments.findIndex((segment) => segment === marker);
  if (index === -1 || index + 1 >= segments.length) return null;
  return decodeURIComponent(segments[index + 1]);
}

export async function GET(request: Request) {
  try {
    const currentUrl = new URL(request.url);
    const developmentId = extractSegment(currentUrl.pathname, "developments");

    if (!developmentId) {
      return NextResponse.json(
        { error: "Parametro developmentId nao informado" },
        { status: 400 }
      );
    }

    const backendUrl = buildBackendUrl(
      `/api/developments/${developmentId}/buildings`,
      currentUrl.searchParams
    );
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "GET",
        cache: "no-store",
        credentials: 'include',
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao buscar torres no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel listar as torres",
      },
      { status: 500 }
    );
  }
}
