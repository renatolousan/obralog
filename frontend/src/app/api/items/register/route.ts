import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = buildBackendUrl("/api/items/register");
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao cadastrar item:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o item",
      },
      { status: 500 }
    );
  }
}

