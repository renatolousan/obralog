import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function GET(request: Request) {
  try {
    const currentUrl = new URL(request.url);
    const backendUrl = buildBackendUrl("/api/users", currentUrl.searchParams);
    
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao buscar usuários no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível buscar os usuários",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Backend espera /api/users/register para cadastro
    const backendUrl = buildBackendUrl("/api/users/register");
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao criar usuário no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível criar o usuário",
      },
      { status: 500 }
    );
  }
}
