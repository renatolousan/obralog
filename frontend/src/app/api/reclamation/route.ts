import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function GET(request: Request) {
  try {
    const currentUrl = new URL(request.url);
    const backendUrl = buildBackendUrl(
      "/api/reclamacoes",
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
    console.error("Erro ao recuperar reclamacoes do backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel buscar as reclamacoes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const descricao = formData.get("descricao")?.toString()?.trim() || "";

    if (descricao.length < 10) {
      return NextResponse.json(
        { message: "A descrição deve ter pelo menos 10 caracteres" },
        { status: 400 }
      );
    }
    if (descricao.length > 200) {
      return NextResponse.json(
        { message: "A descrição deve ter no máximo 200 caracteres" },
        { status: 400 }
      );
    }

    const backendUrl = buildBackendUrl("/api/reclamacoes");
    const { response, payload } = await fetchBackendJson(
      backendUrl,
      {
        method: "POST",
        body: formData,
      },
      request.headers
    );

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Erro ao encaminhar reclamacao para o backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel encaminhar a reclamacao",
      },
      { status: 500 }
    );
  }
}
