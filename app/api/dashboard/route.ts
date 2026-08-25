import { NextResponse } from "next/server";
import { getCrossBoardMetrics } from "@/lib/businessTools";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get("sector") || undefined;

    const analysis = await getCrossBoardMetrics(sector);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data.",
      },
      { status: 500 }
    );
  }
}