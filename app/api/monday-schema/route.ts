import { NextResponse } from "next/server";
import { getBoardColumns } from "@/lib/monday";

export async function GET() {
  try {
    const dealsBoardId = process.env.DEALS_BOARD_ID;
    const workOrdersBoardId = process.env.WORK_ORDERS_BOARD_ID;

    if (!dealsBoardId || !workOrdersBoardId) {
      return NextResponse.json(
        {
          success: false,
          error: "Board IDs are not configured",
        },
        { status: 500 }
      );
    }

    const [dealColumns, workOrderColumns] = await Promise.all([
      getBoardColumns(dealsBoardId),
      getBoardColumns(workOrdersBoardId),
    ]);

    return NextResponse.json({
      success: true,
      deals: dealColumns,
      workOrders: workOrderColumns,
    });
  } catch (error) {
    console.error("Monday schema error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Monday schema error",
      },
      { status: 500 }
    );
  }
}