import { CumulativeTransaction } from "../services/transactions.ts";
import { GraphData } from "./graphing.tsx";

export function barHelper(
  transactions: CumulativeTransaction[],
  key: keyof CumulativeTransaction = "amount",
): GraphData<"bar"> {
  // TODO: fill in empty months
  // TODO: fix multiple bar dataset in one chart.
  return {
    labels: transactions.map((t) => t.date),
    datasets: [{
      type: "bar",
      label: transactions[0].date.getFullYear().toString(),
      data: transactions.map((d) => {
        const value = d[key];
        if (typeof value === "number") {
          return value;
        }

        return d.amount;
      }),
    }],
  };
}
