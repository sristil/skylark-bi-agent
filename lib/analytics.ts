import {
  NormalizedDeal,
  isValidDeal,
} from "./normalize";

export type DealAnalysis = {
  totalDeals: number;

  statusCounts: Record<string, number>;
  statusValues: Record<string, number>;

  openDeals: number;
  openPipelineValue: number;

  wonDeals: number;
  wonRevenue: number;

  lostDeals: number;
  lostValue: number;

  onHoldDeals: number;
  onHoldValue: number;

  dealsByStage: Record<string, number>;
  valueByStage: Record<string, number>;

  dealsBySector: Record<string, number>;
  valueBySector: Record<string, number>;

  averageOpenDealValue: number | null;

  dataQuality: {
    missingDealValues: number;
    missingTentativeCloseDates: number;
    missingSectors: number;
    missingStages: number;
  };
};

function normalizeStatus(
  status: string | null
): string {
  return (
    status
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, " ") || "unknown"
  );
}

function isWon(status: string | null): boolean {
  return normalizeStatus(status) === "won";
}

function isLost(status: string | null): boolean {
  const normalized = normalizeStatus(status);

  return (
    normalized === "dead" ||
    normalized === "lost"
  );
}

function isOnHold(deal: NormalizedDeal): boolean {
  const status = normalizeStatus(deal.status);
  const stage = normalizeStatus(deal.stage);

  return (
    status === "on hold" ||
    stage.includes("projects on hold")
  );
}

function isOpen(deal: NormalizedDeal): boolean {
  if (isWon(deal.status) || isLost(deal.status)) {
    return false;
  }

  if (isOnHold(deal)) {
    return false;
  }

  return normalizeStatus(deal.status) === "open";
}

export function analyzeDeals(
  deals: NormalizedDeal[],
  sectorFilter?: string
): DealAnalysis {
  // Remove malformed/header-like records before analysis.
  const validDeals = deals.filter(isValidDeal);

  // Apply optional sector filtering after data validation.
  const filteredDeals = sectorFilter
    ? validDeals.filter(
        (deal) =>
          deal.sector?.toLowerCase().trim() ===
          sectorFilter.toLowerCase().trim()
      )
    : validDeals;

  const openDeals = filteredDeals.filter(isOpen);

  const wonDeals = filteredDeals.filter((deal) =>
    isWon(deal.status)
  );

  const lostDeals = filteredDeals.filter((deal) =>
    isLost(deal.status)
  );

  const onHoldDeals = filteredDeals.filter(isOnHold);

  const sumValues = (
    records: NormalizedDeal[]
  ): number =>
    records.reduce(
      (sum, deal) => sum + (deal.dealValue ?? 0),
      0
    );

  const openPipelineValue = sumValues(openDeals);

  const wonRevenue = sumValues(wonDeals);

  const lostValue = sumValues(lostDeals);

  const onHoldValue = sumValues(onHoldDeals);

  const knownOpenDeals = openDeals.filter(
    (deal) => deal.dealValue !== null
  );

  const averageOpenDealValue =
    knownOpenDeals.length > 0
      ? openPipelineValue / knownOpenDeals.length
      : null;

  const statusCounts: Record<string, number> = {};

  const statusValues: Record<string, number> = {};

  const dealsByStage: Record<string, number> = {};

  const valueByStage: Record<string, number> = {};

  const dealsBySector: Record<string, number> = {};

  const valueBySector: Record<string, number> = {};

  for (const deal of filteredDeals) {
    const status = deal.status ?? "Unknown";

    const stage = deal.stage ?? "Unknown";

    const sector = deal.sector ?? "Unknown";

    statusCounts[status] =
      (statusCounts[status] ?? 0) + 1;

    dealsByStage[stage] =
      (dealsByStage[stage] ?? 0) + 1;

    dealsBySector[sector] =
      (dealsBySector[sector] ?? 0) + 1;

    if (deal.dealValue !== null) {
      statusValues[status] =
        (statusValues[status] ?? 0) +
        deal.dealValue;

      valueByStage[stage] =
        (valueByStage[stage] ?? 0) +
        deal.dealValue;

      valueBySector[sector] =
        (valueBySector[sector] ?? 0) +
        deal.dealValue;
    }
  }

  return {
    totalDeals: filteredDeals.length,

    statusCounts,

    statusValues,

    openDeals: openDeals.length,

    openPipelineValue,

    wonDeals: wonDeals.length,

    wonRevenue,

    lostDeals: lostDeals.length,

    lostValue,

    onHoldDeals: onHoldDeals.length,

    onHoldValue,

    dealsByStage,

    valueByStage,

    dealsBySector,

    valueBySector,

    averageOpenDealValue,

    dataQuality: {
      missingDealValues: filteredDeals.filter(
        (deal) => deal.dealValue === null
      ).length,

      missingTentativeCloseDates:
        filteredDeals.filter(
          (deal) =>
            deal.tentativeCloseDate === null
        ).length,

      missingSectors: filteredDeals.filter(
        (deal) => deal.sector === null
      ).length,

      missingStages: filteredDeals.filter(
        (deal) => deal.stage === null
      ).length,
    },
  };
}