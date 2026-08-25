import { NextResponse } from "next/server";
import { getDeals, getBoardColumns } from "@/lib/monday";
import { normalizeDeal } from "@/lib/normalize";
import { analyzeDeals } from "@/lib/analytics";

export async function GET() {
  try {
    const boardId = process.env.DEALS_BOARD_ID;

    if (!boardId) {
      return NextResponse.json(
        {
          success: false,
          error: "DEALS_BOARD_ID is not configured",
        },
        { status: 500 }
      );
    }

    const [deals, columns] = await Promise.all([
      getDeals(),
      getBoardColumns(boardId),
    ]);

    const columnMap: Record<string, string> = {};

    for (const column of columns) {
      columnMap[column.id] = column.title;
    }

    const normalizedDeals = deals.map((deal) =>
      normalizeDeal(deal, columnMap)
    );

    const analysis = analyzeDeals(normalizedDeals);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Pipeline analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown pipeline analysis error",
      },
      { status: 500 }
    );
  }
}