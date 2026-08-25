import { NextResponse } from "next/server";
import {
  getWorkOrders,
  getBoardColumns,
} from "@/lib/monday";
import { normalizeWorkOrder } from "@/lib/normalize";
import { analyzeWorkOrders } from "@/lib/workOrderAnalytics";

export async function GET() {
  try {
    const boardId =
      process.env.WORK_ORDERS_BOARD_ID;

    if (!boardId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "WORK_ORDERS_BOARD_ID is not configured",
        },
        { status: 500 }
      );
    }

    const [workOrders, columns] =
      await Promise.all([
        getWorkOrders(),
        getBoardColumns(boardId),
      ]);

    const columnMap: Record<string, string> = {};

    for (const column of columns) {
      columnMap[column.id] = column.title;
    }

    const normalizedWorkOrders =
      workOrders.map((workOrder) =>
        normalizeWorkOrder(
          workOrder,
          columnMap
        )
      );

    const analysis =
      analyzeWorkOrders(
        normalizedWorkOrders
      );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "Work Order analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Work Order analysis error",
      },
      { status: 500 }
    );
  }
}