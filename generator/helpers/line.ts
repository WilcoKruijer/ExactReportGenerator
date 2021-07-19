import { CumulativeTransaction } from "../services/transactions.ts";
import { getMonthList, GraphData } from "./graphing.tsx";

export function lineHelper(
  transactions: CumulativeTransaction[],
): GraphData<"line"> {
  const labels = getMonthList(
    transactions[0].date,
    transactions[transactions.length - 1].date,
  );

  // Create a fake 0th empty so the line starts at 0.
  const zeroEntry = {
    x: transactions[0].date.getTime(),
    y: 0,
  };

  return {
    labels,
    datasets: [{
      type: "line",
      label: transactions[0].date.getFullYear().toString(),
      data: [
        zeroEntry,
        ...transactions.map((d) => ({
          x: d.date.getTime(),
          y: d.cumulativeAmount,
        })),
      ],
      pointRadius: 0,
    }],
  };
}
