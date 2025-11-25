import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ developmentId: string }> }
) {
  const { developmentId } = await params;

  try {
    const url = buildBackendUrl(`/api/ai/analisar-risco/${developmentId}`);
    const { payload } = await fetchBackendJson(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      request.headers
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error analyzing risk:", error);
    return NextResponse.json(
      { error: "Erro ao analisar risco do empreendimento" },
      { status: 500 }
    );
  }
}
