import type { TransactionLine } from "../../deps.ts";
import { cumulativeSum, groupBy, init } from "../util/collections.ts";
import type { Selector } from "../util/collections.ts";

export type DateAggregator = "day" | "month";

export function isDateAggregator(val: unknown): val is DateAggregator {
  return (typeof val === "string" &&
    (val === "day" || val === "month" || val === "year"));
}

export const dailyAggregator: Selector<SimpleTransaction, string> = (t) => {
  const d = new Date(t.Date);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}Z`;
};

export const monthlyAggregator: Selector<SimpleTransaction, string> = (t) => {
  const d = new Date(t.Date);
  // + 1 because months are 0-indexed. Z to ignore timezones.
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}Z`;
};

export const yearlyAggregator: Selector<SimpleTransaction, string> = (t) => {
  const d = new Date(t.Date);
  return `${d.getUTCFullYear()}Z`;
};

export type SimpleTransaction = Pick<
  TransactionLine,
  "AmountDC" | "Date" | "FinancialYear"
>;

export interface AggregatedTransaction {
  amount: number;
  date: Date;
  cumulativeAmount?: number;
}

export interface CumulativeTransaction extends AggregatedTransaction {
  cumulativeAmount: number;
}

export function isSimpleTransaction(t: unknown): t is SimpleTransaction {
  function isPartialSimpleTransaction(
    options: unknown,
  ): options is Partial<Record<keyof SimpleTransaction, unknown>> {
    return typeof options === "object" && options !== null;
  }

  return (
    isPartialSimpleTransaction(t) &&
    typeof t.AmountDC === "number" &&
    typeof t.Date === "string"
  );
}

export function isSimpleTransactionArray(
  arr: unknown,
): arr is Array<SimpleTransaction> {
  if (!Array.isArray(arr)) {
    return false;
  }

  return !arr.some((a) => !isSimpleTransaction(a));
}

export function sortTransactions(transactions: SimpleTransaction[]) {
  return transactions.sort((t1, t2) =>
    new Date(t1.Date).getTime() - new Date(t2.Date).getTime()
  );
}

export function aggregateTransactions(
  transactions: SimpleTransaction[],
  aggregator: Selector<SimpleTransaction, string> | DateAggregator =
    dailyAggregator,
  yearOffset: number | undefined = undefined,
): CumulativeTransaction[] {
  if (!transactions.length) {
    return [];
  }
  transactions = sortTransactions(transactions);

  switch (aggregator) {
    case "day":
      aggregator = dailyAggregator;
      break;
    case "month":
      aggregator = monthlyAggregator;
      break;
    case "year":
      aggregator = yearlyAggregator;
      break;
  }

  // Get the sum of all transactions besides the very last one.
  const initialTransactions = init(transactions);
  const initSum = initialTransactions.reduce((acc, t) => acc + t.AmountDC, 0);

  if (transactions[transactions.length - 1].AmountDC === -initSum) {
    // When a fiscal year is closed the last transaction set the ledger to 0.
    // We do not want this transaction in the graph.
    transactions = initialTransactions;
  }

  // Group transactions by day.
  const grouped = groupBy(
    transactions,
    aggregator,
  );

  // Sums all groups
  const aggregated: AggregatedTransaction[] = Object
    .entries(grouped).map((entry) => {
      const [dateString, dailyTransactions] = entry;
      const d = new Date(dateString);

      if (yearOffset) {
        d.setUTCFullYear(d.getUTCFullYear() + yearOffset);
      }

      return {
        date: d,
        amount: -1 * dailyTransactions.reduce((acc, t) => acc + t.AmountDC, 0),
      };
    });

  return cumulativeSum(aggregated.map((a) => a.amount)).map(
    (cumSum, idx) => {
      return {
        ...aggregated[idx],
        cumulativeAmount: cumSum,
      };
    },
  );
}
