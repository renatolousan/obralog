import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function GET(request: Request) {
  try {
    const currentUrl = new URL(request.url);
    const backendUrl = buildBackendUrl("/api/users/me", currentUrl.searchParams);
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
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do usuário",
      },
      { status: 500 }
    );
  }
}

