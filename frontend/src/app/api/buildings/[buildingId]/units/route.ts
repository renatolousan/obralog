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
    const buildingId = extractSegment(currentUrl.pathname, "buildings");

    if (!buildingId) {
      return NextResponse.json(
        { error: "Parametro buildingId nao informado" },
        { status: 400 }
      );
    }

    const backendUrl = buildBackendUrl(
      `/api/buildings/${buildingId}/units`,
      currentUrl.searchParams
    );
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "GET",
        cache: "no-store",
        credentials: 'include'
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao buscar unidades no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel listar as unidades",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUrl = new URL(request.url);
    const buildingId = extractSegment(currentUrl.pathname, "buildings");

    if (!buildingId) {
      return NextResponse.json(
        { error: "Parametro buildingId nao informado" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const backendUrl = buildBackendUrl("/api/units");
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: 'include'
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao criar unidade no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel criar a unidade",
      },
      { status: 500 }
    );
  }
}
