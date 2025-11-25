import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = buildBackendUrl("/api/ai/complaint-action");
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao obter sugestão da IA:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível obter a sugestão da IA",
      },
      { status: 500 }
    );
  }
}
