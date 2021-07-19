import {
  aggregateTransactions,
  isDateAggregator,
  isSimpleTransactionArray,
} from "../services/transactions.ts";

export function aggregateHelper(
  transactions: unknown,
  aggregator: unknown = "day",
) {
  if (!isSimpleTransactionArray(transactions)) {
    throw new TypeError(
      "Invalid data in file. Expected an array of transactions.",
    );
  }
  if (!isDateAggregator(aggregator)) {
    throw new TypeError(`Invalid aggregator '${aggregator}'.`);
  }

  return aggregateTransactions(transactions, aggregator);
}
