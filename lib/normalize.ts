export type NormalizedDeal = {
  id: string;
  name: string;
  ownerCode: string | null;
  clientCode: string | null;
  status: string | null;
  closeDate: string | null;
  closureProbability: number | null;
  dealValue: number | null;
  tentativeCloseDate: string | null;
  stage: string | null;
  product: string | null;
  sector: string | null;
  createdDate: string | null;
};

export type NormalizedWorkOrder = {
  id: string;
  name: string;

  customerCode: string | null;
  serialNumber: string | null;

  natureOfWork: string | null;
  executionStatus: string | null;

  poDate: string | null;
  probableStartDate: string | null;
  probableEndDate: string | null;

  ownerCode: string | null;
  sector: string | null;
  typeOfWork: string | null;

  // Financial values - primary analysis uses Excl. GST
  workOrderAmount: number | null;
  workOrderAmountInclGST: number | null;

  billedAmount: number | null;
  billedAmountInclGST: number | null;

  collectedAmount: number | null;
  collectedAmountInclGST: number | null;

  amountToBeBilled: number | null;
  amountToBeBilledInclGST: number | null;

  amountReceivable: number | null;

  invoiceStatus: string | null;
  billingStatus: string | null;
  collectionStatus: string | null;
  woStatusBilled: string | null;

  lastInvoiceDate: string | null;
  collectionDate: string | null;

  expectedBillingMonth: string | null;
  actualBillingMonth: string | null;
  actualCollectionMonth: string | null;

  quantityByOps: string | null;
  quantityAsPerPO: string | null;
  quantityBilled: string | null;
  balanceQuantity: string | null;

  arPriority: string | null;
};

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function cleanText(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = value
    .replace(/^"(.*)"$/, "$1")
    .trim();

  if (
    !cleaned ||
    cleaned.toLowerCase() === "null"
  ) {
    return null;
  }

  return cleaned;
}

export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseNumber(
  value: string | null | undefined
): number | null {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return null;
  }

  const normalized = cleaned
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number)
    ? number
    : null;
}

function parseDate(
  value: string | null | undefined
): string | null {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
}

function getValue(
  values: Record<string, string | null>,
  ...possibleNames: string[]
): string | null {
  for (const name of possibleNames) {
    const key = normalizeKey(name);

    if (values[key] !== undefined) {
      return values[key];
    }
  }

  return null;
}

function buildValues(
  columnValues: Array<{
    id: string;
    text: string;
  }>,
  columnMap: Record<string, string>
): Record<string, string | null> {
  const values: Record<string, string | null> = {};

  for (const column of columnValues) {
    const title = columnMap[column.id];

    if (title) {
      values[normalizeKey(title)] =
        column.text || null;
    }
  }

  return values;
}

/* =========================================================
   DEAL NORMALIZATION
   ========================================================= */

export function normalizeDeal(
  item: {
    id: string;
    name: string;
    column_values: Array<{
      id: string;
      text: string;
    }>;
  },
  columnMap: Record<string, string>
): NormalizedDeal {
  const values = buildValues(
    item.column_values,
    columnMap
  );

  return {
    id: item.id,

    name:
      cleanText(item.name) ??
      "Unnamed deal",

    ownerCode: cleanText(
      getValue(values, "Owner code")
    ),

    clientCode: cleanText(
      getValue(values, "Client Code")
    ),

    status: cleanText(
      getValue(values, "Deal Status")
    ),

    closeDate: parseDate(
      getValue(
        values,
        "Close Date (A)",
        "Close Date"
      )
    ),

    closureProbability: parseNumber(
      getValue(
        values,
        "Closure Probability"
      )
    ),

    dealValue: parseNumber(
      getValue(
        values,
        "Masked Deal value",
        "Deal Value"
      )
    ),

    tentativeCloseDate: parseDate(
      getValue(
        values,
        "Tentative Close Date"
      )
    ),

    stage: cleanText(
      getValue(values, "Deal Stage")
    ),

    product: cleanText(
      getValue(
        values,
        "Product",
        "Product deal"
      )
    ),

    sector: cleanText(
      getValue(
        values,
        "Sector",
        "Sector/service"
      )
    ),

    createdDate: parseDate(
      getValue(values, "Created Date")
    ),
  };
}

/* =========================================================
   DEAL VALIDATION
   ========================================================= */

export function isValidDeal(
  deal: NormalizedDeal
): boolean {
  const invalidStatuses = new Set([
    "deal status",
    "status",
  ]);

  const invalidStages = new Set([
    "deal stage",
    "stage",
  ]);

  const status =
    deal.status
      ?.toLowerCase()
      .trim();

  const stage =
    deal.stage
      ?.toLowerCase()
      .trim();

  if (
    invalidStatuses.has(
      status ?? ""
    )
  ) {
    return false;
  }

  if (
    invalidStages.has(
      stage ?? ""
    )
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   WORK ORDER NORMALIZATION
   ========================================================= */

export function normalizeWorkOrder(
  item: {
    id: string;
    name: string;
    column_values: Array<{
      id: string;
      text: string;
    }>;
  },
  columnMap: Record<string, string>
): NormalizedWorkOrder {
  const values = buildValues(
    item.column_values,
    columnMap
  );

  return {
    id: item.id,

    name:
      cleanText(item.name) ??
      "Unnamed work order",

    customerCode: cleanText(
      getValue(
        values,
        "Customer Name Code"
      )
    ),

    serialNumber: cleanText(
      getValue(values, "Serial #")
    ),

    natureOfWork: cleanText(
      getValue(values, "Nature of Work")
    ),

    executionStatus: cleanText(
      getValue(
        values,
        "Execution Status"
      )
    ),

    poDate: parseDate(
      getValue(
        values,
        "Date of PO/LOI"
      )
    ),

    probableStartDate: parseDate(
      getValue(
        values,
        "Probable Start Date"
      )
    ),

    probableEndDate: parseDate(
      getValue(
        values,
        "Probable End Date"
      )
    ),

    ownerCode: cleanText(
      getValue(
        values,
        "BD/KAM Personnel code"
      )
    ),

    sector: cleanText(
      getValue(values, "Sector")
    ),

    typeOfWork: cleanText(
      getValue(values, "Type of Work")
    ),

    /*
     * Primary financial values use Excl. GST.
     */
    workOrderAmount: parseNumber(
      getValue(
        values,
        "Amount in Rupees (Excl of GST) (Masked)"
      )
    ),

    workOrderAmountInclGST: parseNumber(
      getValue(
        values,
        "Amount in Rupees (Incl of GST) (Masked)"
      )
    ),

    billedAmount: parseNumber(
      getValue(
        values,
        "Billed Value in Rupees (Excl of GST.) (Masked)"
      )
    ),

    billedAmountInclGST: parseNumber(
      getValue(
        values,
        "Billed Value in Rupees (Incl of GST.) (Masked)"
      )
    ),

    collectedAmount: parseNumber(
      getValue(
        values,
        "Collected Amount in Rupees (Incl of GST.) (Masked)"
      )
    ),

    /*
     * There is no explicit Excl-GST collected amount
     * in the schema, so the available GST-inclusive
     * collected amount is retained as-is.
     */
    collectedAmountInclGST: parseNumber(
      getValue(
        values,
        "Collected Amount in Rupees (Incl of GST.) (Masked)"
      )
    ),

    amountToBeBilled: parseNumber(
      getValue(
        values,
        "Amount to be billed in Rs. (Exl. of GST) (Masked)"
      )
    ),

    amountToBeBilledInclGST: parseNumber(
      getValue(
        values,
        "Amount to be billed in Rs. (Incl. of GST) (Masked)"
      )
    ),

    amountReceivable: parseNumber(
      getValue(
        values,
        "Amount Receivable (Masked)"
      )
    ),

    invoiceStatus: cleanText(
      getValue(
        values,
        "Invoice Status"
      )
    ),

    billingStatus: cleanText(
      getValue(
        values,
        "Billing Status"
      )
    ),

    collectionStatus: cleanText(
      getValue(
        values,
        "Collection status"
      )
    ),

    woStatusBilled: cleanText(
      getValue(
        values,
        "WO Status (billed)"
      )
    ),

    lastInvoiceDate: parseDate(
      getValue(
        values,
        "Last invoice date"
      )
    ),

    collectionDate: parseDate(
      getValue(
        values,
        "Collection Date"
      )
    ),

    expectedBillingMonth: cleanText(
      getValue(
        values,
        "Expected Billing Month"
      )
    ),

    actualBillingMonth: cleanText(
      getValue(
        values,
        "Actual Billing Month"
      )
    ),

    actualCollectionMonth: cleanText(
      getValue(
        values,
        "Actual Collection Month"
      )
    ),

    quantityByOps: cleanText(
      getValue(
        values,
        "Quantity by Ops"
      )
    ),

    quantityAsPerPO: cleanText(
      getValue(
        values,
        "Quantities as per PO"
      )
    ),

    quantityBilled: cleanText(
      getValue(
        values,
        "Quantity billed (till date)"
      )
    ),

    balanceQuantity: cleanText(
      getValue(
        values,
        "Balance in quantity"
      )
    ),

    arPriority: cleanText(
      getValue(
        values,
        "AR Priority account"
      )
    ),
  };
}