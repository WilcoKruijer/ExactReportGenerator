import {
  aggregateTransactions,
  isDateAggregator,
  isSimpleTransactionArray,
} from "../services/transactions.ts";
import { writeDebugFile } from "./helper_util.ts";

let debugFileIndex = 0;

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

  const result = aggregateTransactions(transactions, aggregator);

  writeDebugFile(`aggregate_${aggregator}_${debugFileIndex++}`, result);

  return result;
}
