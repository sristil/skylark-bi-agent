import { NormalizedWorkOrder } from "./normalize";

export type WorkOrderAnalysis = {
  totalWorkOrders: number;

  completedWorkOrders: number;
  activeWorkOrders: number;

  totalWorkOrderValue: number;
  totalBilledValue: number;
  totalCollectedValue: number;
  totalAmountToBeBilled: number;
  totalAmountReceivable: number;

  billingCoveragePercent: number | null;
  collectionCoveragePercent: number | null;

  executionStatusCounts: Record<string, number>;
  valueByExecutionStatus: Record<string, number>;

  workOrdersBySector: Record<string, number>;
  valueBySector: Record<string, number>;
  receivablesBySector: Record<string, number>;

  billingStatusCounts: Record<string, number>;
  collectionStatusCounts: Record<string, number>;

  dataQuality: {
    missingWorkOrderValues: number;
    missingBilledValues: number;
    missingCollectedValues: number;
    missingReceivableValues: number;
    missingExecutionStatus: number;
    missingSector: number;
  };
};

function normalizeStatus(
  value: string | null
): string {
  return (
    value
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, " ") || "unknown"
  );
}

function isCompleted(
  workOrder: NormalizedWorkOrder
): boolean {
  const status = normalizeStatus(
    workOrder.executionStatus
  );

  return (
    status === "completed" ||
    status === "complete"
  );
}

function isActive(
  workOrder: NormalizedWorkOrder
): boolean {
  const status = normalizeStatus(
    workOrder.executionStatus
  );

  return (
    status !== "completed" &&
    status !== "complete" &&
    status !== "cancelled" &&
    status !== "canceled"
  );
}

function sumValues(
  workOrders: NormalizedWorkOrder[],
  getter: (
    workOrder: NormalizedWorkOrder
  ) => number | null
): number {
  return workOrders.reduce(
    (sum, workOrder) =>
      sum + (getter(workOrder) ?? 0),
    0
  );
}

export function analyzeWorkOrders(
  workOrders: NormalizedWorkOrder[],
  sectorFilter?: string
): WorkOrderAnalysis {
  const filteredWorkOrders = sectorFilter
    ? workOrders.filter(
        (workOrder) =>
          workOrder.sector
            ?.toLowerCase()
            .trim() ===
          sectorFilter
            .toLowerCase()
            .trim()
      )
    : workOrders;

  const completedWorkOrders =
    filteredWorkOrders.filter(isCompleted);

  const activeWorkOrders =
    filteredWorkOrders.filter(isActive);

  const totalWorkOrderValue = sumValues(
    filteredWorkOrders,
    (workOrder) =>
      workOrder.workOrderAmount
  );

  const totalBilledValue = sumValues(
    filteredWorkOrders,
    (workOrder) =>
      workOrder.billedAmount
  );

  const totalCollectedValue = sumValues(
    filteredWorkOrders,
    (workOrder) =>
      workOrder.collectedAmountInclGST
  );

  const totalAmountToBeBilled = sumValues(
    filteredWorkOrders,
    (workOrder) =>
      workOrder.amountToBeBilled
  );

  const totalAmountReceivable = sumValues(
    filteredWorkOrders,
    (workOrder) =>
      workOrder.amountReceivable
  );

  const billingCoveragePercent =
    totalWorkOrderValue > 0
      ? (totalBilledValue /
          totalWorkOrderValue) *
        100
      : null;

  const collectionCoveragePercent =
    totalBilledValue > 0
      ? (totalCollectedValue /
          totalBilledValue) *
        100
      : null;

  const executionStatusCounts: Record<
    string,
    number
  > = {};

  const valueByExecutionStatus: Record<
    string,
    number
  > = {};

  const workOrdersBySector: Record<
    string,
    number
  > = {};

  const valueBySector: Record<
    string,
    number
  > = {};

  const receivablesBySector: Record<
    string,
    number
  > = {};

  const billingStatusCounts: Record<
    string,
    number
  > = {};

  const collectionStatusCounts: Record<
    string,
    number
  > = {};

  for (const workOrder of filteredWorkOrders) {
    const executionStatus =
      workOrder.executionStatus ??
      "Unknown";

    const sector =
      workOrder.sector ??
      "Unknown";

    const billingStatus =
      workOrder.billingStatus ??
      "Unknown";

    const collectionStatus =
      workOrder.collectionStatus ??
      "Unknown";

    executionStatusCounts[
      executionStatus
    ] =
      (executionStatusCounts[
        executionStatus
      ] ?? 0) + 1;

    workOrdersBySector[sector] =
      (workOrdersBySector[sector] ?? 0) +
      1;

    billingStatusCounts[
      billingStatus
    ] =
      (billingStatusCounts[
        billingStatus
      ] ?? 0) + 1;

    collectionStatusCounts[
      collectionStatus
    ] =
      (collectionStatusCounts[
        collectionStatus
      ] ?? 0) + 1;

    if (workOrder.workOrderAmount !== null) {
      valueByExecutionStatus[
        executionStatus
      ] =
        (valueByExecutionStatus[
          executionStatus
        ] ?? 0) +
        workOrder.workOrderAmount;

      valueBySector[sector] =
        (valueBySector[sector] ?? 0) +
        workOrder.workOrderAmount;
    }

    if (workOrder.amountReceivable !== null) {
      receivablesBySector[sector] =
        (receivablesBySector[sector] ?? 0) +
        workOrder.amountReceivable;
    }
  }

  return {
    totalWorkOrders:
      filteredWorkOrders.length,

    completedWorkOrders:
      completedWorkOrders.length,

    activeWorkOrders:
      activeWorkOrders.length,

    totalWorkOrderValue,

    totalBilledValue,

    totalCollectedValue,

    totalAmountToBeBilled,

    totalAmountReceivable,

    billingCoveragePercent,

    collectionCoveragePercent,

    executionStatusCounts,

    valueByExecutionStatus,

    workOrdersBySector,

    valueBySector,

    receivablesBySector,

    billingStatusCounts,

    collectionStatusCounts,

    dataQuality: {
      missingWorkOrderValues:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.workOrderAmount === null
        ).length,

      missingBilledValues:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.billedAmount === null
        ).length,

      missingCollectedValues:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.collectedAmountInclGST ===
            null
        ).length,

      missingReceivableValues:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.amountReceivable === null
        ).length,

      missingExecutionStatus:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.executionStatus === null
        ).length,

      missingSector:
        filteredWorkOrders.filter(
          (workOrder) =>
            workOrder.sector === null
        ).length,
    },
  };
}