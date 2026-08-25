import {
  getDeals,
  getWorkOrders,
  getBoardColumns,
} from "./monday";

import {
  normalizeDeal,
  normalizeWorkOrder,
} from "./normalize";

import { analyzeDeals } from "./analytics";

import { analyzeWorkOrders } from "./workOrderAnalytics";

import { analyzeCrossBoard } from "./crossBoardAnalytics";

async function loadData() {
  const dealsBoardId =
    process.env.DEALS_BOARD_ID;

  const workOrdersBoardId =
    process.env.WORK_ORDERS_BOARD_ID;

  if (
    !dealsBoardId ||
    !workOrdersBoardId
  ) {
    throw new Error(
      "Monday board IDs are not configured"
    );
  }

  const [
    deals,
    workOrders,
    dealColumns,
    workOrderColumns,
  ] = await Promise.all([
    getDeals(),
    getWorkOrders(),
    getBoardColumns(dealsBoardId),
    getBoardColumns(workOrdersBoardId),
  ]);

  const dealColumnMap: Record<
    string,
    string
  > = {};

  for (const column of dealColumns) {
    dealColumnMap[column.id] =
      column.title;
  }

  const workOrderColumnMap: Record<
    string,
    string
  > = {};

  for (const column of workOrderColumns) {
    workOrderColumnMap[column.id] =
      column.title;
  }

  const normalizedDeals =
    deals.map((deal) =>
      normalizeDeal(
        deal,
        dealColumnMap
      )
    );

  const normalizedWorkOrders =
    workOrders.map((workOrder) =>
      normalizeWorkOrder(
        workOrder,
        workOrderColumnMap
      )
    );

  return {
    deals: normalizedDeals,
    workOrders: normalizedWorkOrders,
  };
}

/**
 * Sales / pipeline tool
 */
export async function getPipelineMetrics(
  sector?: string
) {
  const { deals } =
    await loadData();

  return analyzeDeals(
    deals,
    sector
  );
}

/**
 * Operations / work-order tool
 */
export async function getWorkOrderMetrics(
  sector?: string
) {
  const { workOrders } =
    await loadData();

  return analyzeWorkOrders(
    workOrders,
    sector
  );
}

/**
 * Combined business intelligence tool
 */
export async function getCrossBoardMetrics(
  sector?: string
) {
  const {
    deals,
    workOrders,
  } = await loadData();

  return analyzeCrossBoard(
    deals,
    workOrders,
    sector
  );
}