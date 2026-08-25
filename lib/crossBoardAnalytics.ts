import { NormalizedDeal, NormalizedWorkOrder } from "./normalize";
import { analyzeDeals } from "./analytics";
import { analyzeWorkOrders } from "./workOrderAnalytics";

export type CrossBoardAnalysis = {
  sector: string | null;

  deals: {
    totalDeals: number;
    openDeals: number;
    openPipelineValue: number;
    wonDeals: number;
    wonRevenue: number;
    lostDeals: number;
    lostValue: number;
    onHoldDeals: number;
    onHoldValue: number;
  };

  workOrders: {
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
  };

  dataQuality: {
    dealRecords: number;
    workOrderRecords: number;
  };
};

export function analyzeCrossBoard(
  deals: NormalizedDeal[],
  workOrders: NormalizedWorkOrder[],
  sector?: string
): CrossBoardAnalysis {
  const dealAnalysis = analyzeDeals(
    deals,
    sector
  );

  const workOrderAnalysis =
    analyzeWorkOrders(
      workOrders,
      sector
    );

  return {
    sector: sector ?? null,

    deals: {
      totalDeals: dealAnalysis.totalDeals,

      openDeals: dealAnalysis.openDeals,

      openPipelineValue:
        dealAnalysis.openPipelineValue,

      wonDeals: dealAnalysis.wonDeals,

      wonRevenue:
        dealAnalysis.wonRevenue,

      lostDeals:
        dealAnalysis.lostDeals,

      lostValue:
        dealAnalysis.lostValue,

      onHoldDeals:
        dealAnalysis.onHoldDeals,

      onHoldValue:
        dealAnalysis.onHoldValue,
    },

    workOrders: {
      totalWorkOrders:
        workOrderAnalysis.totalWorkOrders,

      completedWorkOrders:
        workOrderAnalysis.completedWorkOrders,

      activeWorkOrders:
        workOrderAnalysis.activeWorkOrders,

      totalWorkOrderValue:
        workOrderAnalysis.totalWorkOrderValue,

      totalBilledValue:
        workOrderAnalysis.totalBilledValue,

      totalCollectedValue:
        workOrderAnalysis.totalCollectedValue,

      totalAmountToBeBilled:
        workOrderAnalysis.totalAmountToBeBilled,

      totalAmountReceivable:
        workOrderAnalysis.totalAmountReceivable,

      billingCoveragePercent:
        workOrderAnalysis.billingCoveragePercent,

      collectionCoveragePercent:
        workOrderAnalysis.collectionCoveragePercent,
    },

    dataQuality: {
      dealRecords:
        dealAnalysis.totalDeals,

      workOrderRecords:
        workOrderAnalysis.totalWorkOrders,
    },
  };
}