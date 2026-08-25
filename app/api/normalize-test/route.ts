import { NextResponse } from "next/server";
import { getDeals, getBoardColumns } from "@/lib/monday";
import { normalizeDeal } from "@/lib/normalize";

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

    const normalized = deals.map((deal) =>
      normalizeDeal(deal, columnMap)
    );

    return NextResponse.json({
      success: true,
      count: normalized.length,
      sample: normalized.slice(0, 5),
    });
  } catch (error) {
    console.error("Normalization error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown normalization error",
      },
      { status: 500 }
    );
  }
}