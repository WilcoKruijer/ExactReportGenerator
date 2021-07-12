import type { TransactionLine } from "../deps.ts";
import { cumulativeSum, groupBy, init } from "./util/collections.ts";
import type { Selector } from "./util/collections.ts";

export type DateAggregator = "day" | "month";

export function isDateAggregator(val: unknown): val is DateAggregator {
  return (typeof val === "string" && (val === "day" || val === "month"));
}

export const dailyAggregator: Selector<TransactionLine, string> = (t) =>
  new Date(t.Date).toDateString();

export const monthlyAggregator: Selector<TransactionLine, string> = (t) => {
  const d = new Date(t.Date);
  // + 1 because months are 0-indexed. Z to ignore timezones.
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}Z`;
};

export interface AggregatedTransaction {
  amount: number;
  cumulativeAmount: number;
  date: Date;
}

export function aggregateTransactions(
  transactions: TransactionLine[],
  aggregator = dailyAggregator,
): AggregatedTransaction[] {
  if (!transactions.length) {
    return [];
  }

  // Sort the transactions by its dates
  transactions = transactions.sort((t1, t2) =>
    new Date(t1.Date).getTime() - new Date(t2.Date).getTime()
  );

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

  const aggregated: Omit<AggregatedTransaction, "cumulativeAmount">[] = Object
    .entries(grouped).map((entry) => {
      const [dateString, dailyTransactions] = entry;
      return {
        date: new Date(dateString),
        amount: -1 * dailyTransactions.reduce((acc, t) => acc + t.AmountDC, 0),
      };
    });

  // Make copy of date
  const zeroDate = new Date(aggregated[0].date);
  // Set the date to one day earlier.
  // zeroDate.setDate(zeroDate.getDate());

  // Create a fake 0th empty so the line starts at 0.
  const zeroEntry: AggregatedTransaction = {
    date: zeroDate,
    amount: 0,
    cumulativeAmount: 0,
  };

  return [
    // Add the zero entry
    zeroEntry,
    // Get cumulative list and combine it with the aggregated list
    ...cumulativeSum(aggregated.map((a) => a.amount)).map(
      (cumSum, idx) => {
        return {
          ...aggregated[idx],
          cumulativeAmount: cumSum,
        };
      },
    ),
  ];
}
