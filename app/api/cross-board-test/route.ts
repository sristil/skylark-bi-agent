import { NextResponse } from "next/server";

import {
  getDeals,
  getWorkOrders,
  getBoardColumns,
} from "@/lib/monday";

import {
  normalizeDeal,
  normalizeWorkOrder,
} from "@/lib/normalize";

import {
  analyzeCrossBoard,
} from "@/lib/crossBoardAnalytics";

export async function GET(
  request: Request
) {
  try {
    // Read query parameters
    const { searchParams } =
      new URL(request.url);

    const sector =
      searchParams.get("sector")?.trim() ||
      undefined;

    const dealsBoardId =
      process.env.DEALS_BOARD_ID;

    const workOrdersBoardId =
      process.env.WORK_ORDERS_BOARD_ID;

    if (
      !dealsBoardId ||
      !workOrdersBoardId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Board IDs are not configured",
        },
        { status: 500 }
      );
    }

    // Fetch both boards and their schemas
    const [
      deals,
      workOrders,
      dealColumns,
      workOrderColumns,
    ] = await Promise.all([
      getDeals(),
      getWorkOrders(),

      getBoardColumns(
        dealsBoardId
      ),

      getBoardColumns(
        workOrdersBoardId
      ),
    ]);

    // Build Deal column map
    const dealColumnMap: Record<
      string,
      string
    > = {};

    for (const column of dealColumns) {
      dealColumnMap[column.id] =
        column.title;
    }

    // Build Work Order column map
    const workOrderColumnMap: Record<
      string,
      string
    > = {};

    for (const column of workOrderColumns) {
      workOrderColumnMap[
        column.id
      ] = column.title;
    }

    // Normalize Deals
    const normalizedDeals =
      deals.map((deal) =>
        normalizeDeal(
          deal,
          dealColumnMap
        )
      );

    // Normalize Work Orders
    const normalizedWorkOrders =
      workOrders.map((workOrder) =>
        normalizeWorkOrder(
          workOrder,
          workOrderColumnMap
        )
      );

    // Run cross-board analysis
    const analysis =
      analyzeCrossBoard(
        normalizedDeals,
        normalizedWorkOrders,
        sector
      );

    return NextResponse.json({
      success: true,

      query: {
        sector: sector ?? null,
      },

      analysis,
    });
  } catch (error) {
    console.error(
      "Cross-board analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown cross-board error",
      },
      { status: 500 }
    );
  }
}