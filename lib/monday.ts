const MONDAY_API_URL = "https://api.monday.com/v2";

type MondayResponse<T> = {
  data?: T;
  errors?: Array<{
    message: string;
  }>;
};

export type MondayColumn = {
  id: string;
  title: string;
  type: string;
};

type BoardColumnsResponse = {
  boards: Array<{
    id: string;
    name: string;
    columns: MondayColumn[];
  }>;
};

export type MondayColumnValue = {
  id: string;
  text: string;
  value: string | null;
};

export type MondayItem = {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
};

type ItemsPageResponse = {
  boards: Array<{
    items_page: {
      cursor: string | null;
      items: MondayItem[];
    };
  }>;
};

type NextItemsPageResponse = {
  next_items_page: {
    cursor: string | null;
    items: MondayItem[];
  };
};

export async function mondayQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;

  if (!token) {
    throw new Error("MONDAY_API_TOKEN is not configured");
  }

  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Monday API request failed: ${response.status} ${response.statusText}`
    );
  }

  const result: MondayResponse<T> = await response.json();

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; ")
    );
  }

  if (!result.data) {
    throw new Error("Monday API returned no data");
  }

  return result.data;
}

export async function getBoardItems(
  boardId: string
): Promise<MondayItem[]> {
  const firstPage = await mondayQuery<ItemsPageResponse>(
    `
      query GetBoardItems($boardId: [ID!]!) {
        boards(ids: $boardId) {
          items_page(limit: 500) {
            cursor
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `,
    {
      boardId: [boardId],
    }
  );

  if (!firstPage.boards.length) {
    throw new Error(`Board ${boardId} was not found`);
  }

  const items = [...firstPage.boards[0].items_page.items];

  let cursor = firstPage.boards[0].items_page.cursor;

  while (cursor) {
    const nextPage = await mondayQuery<NextItemsPageResponse>(
      `
        query GetNextItemsPage($cursor: String!) {
          next_items_page(limit: 500, cursor: $cursor) {
            cursor
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      `,
      {
        cursor,
      }
    );

    items.push(...nextPage.next_items_page.items);
    cursor = nextPage.next_items_page.cursor;
  }

  return items;
}

export async function getDeals(): Promise<MondayItem[]> {
  const boardId = process.env.DEALS_BOARD_ID;

  if (!boardId) {
    throw new Error("DEALS_BOARD_ID is not configured");
  }

  return getBoardItems(boardId);
}

export async function getWorkOrders(): Promise<MondayItem[]> {
  const boardId = process.env.WORK_ORDERS_BOARD_ID;

  if (!boardId) {
    throw new Error("WORK_ORDERS_BOARD_ID is not configured");
  }

  return getBoardItems(boardId);
}

export async function getBoardColumns(
  boardId: string
): Promise<MondayColumn[]> {
  const data = await mondayQuery<BoardColumnsResponse>(
    `
      query GetBoardColumns($boardId: [ID!]!) {
        boards(ids: $boardId) {
          id
          name
          columns {
            id
            title
            type
          }
        }
      }
    `,
    {
      boardId: [boardId],
    }
  );

  if (!data.boards.length) {
    throw new Error(`Board ${boardId} was not found`);
  }

  return data.boards[0].columns;
}