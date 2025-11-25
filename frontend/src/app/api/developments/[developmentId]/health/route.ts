import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ developmentId: string }> }
) {
  const { developmentId } = await params;

  try {
    const url = buildBackendUrl(`/api/developments/${developmentId}/health`);
    const { payload } = await fetchBackendJson(
      url,
      {
        method: "GET",
      },
      request.headers
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching health:", error);
    return NextResponse.json(
      { error: "Erro ao buscar saúde do empreendimento" },
      { status: 500 }
    );
  }
}
