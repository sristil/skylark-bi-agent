import { NextResponse } from "next/server";
import { mondayQuery } from "@/lib/monday";

type BoardQuery = {
  boards: Array<{
    id: string;
    name: string;
  }>;
};

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

    const data = await mondayQuery<BoardQuery>(
      `
        query GetBoards($ids: [ID!]!) {
          boards(ids: $ids) {
            id
            name
          }
        }
      `,
      {
        ids: [dealsBoardId, workOrdersBoardId],
      }
    );

    return NextResponse.json({
      success: true,
      boards: data.boards,
    });
  } catch (error) {
    console.error("Monday connection error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Monday API error",
      },
      { status: 500 }
    );
  }
}