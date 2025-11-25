import { NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // Verifica se é um arquivo CSV pela extensão
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Apenas arquivos CSV são permitidos." },
        { status: 400 }
      );
    }

    // Passa o formData original diretamente para o backend
    const backendUrl = buildBackendUrl("/api/items/mass-register");
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
    console.error("Erro ao processar cadastro em massa no backend:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível processar o cadastro em massa",
      },
      { status: 500 }
    );
  }
}

