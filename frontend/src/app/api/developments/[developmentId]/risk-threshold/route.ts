import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl, fetchBackendJson } from "@/app/api/_lib/backend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ developmentId: string }> }
) {
  const { developmentId } = await params;

  try {
    const body = await request.json();
    const url = buildBackendUrl(`/api/developments/${developmentId}/risk-threshold`);
    
    const { payload } = await fetchBackendJson(
      url,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      request.headers
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error updating risk threshold:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar limiar de risco" },
      { status: 500 }
    );
  }
}
