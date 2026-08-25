import { NextResponse } from "next/server";
import { getDeals, getWorkOrders } from "@/lib/monday";

export async function GET() {
  try {
    const [deals, workOrders] = await Promise.all([
      getDeals(),
      getWorkOrders(),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        deals: deals.length,
        workOrders: workOrders.length,
      },
      sample: {
        deal: deals[0],
        workOrder: workOrders[0],
      },
    });
  } catch (error) {
    console.error("Monday data error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Monday data error",
      },
      { status: 500 }
    );
  }
}