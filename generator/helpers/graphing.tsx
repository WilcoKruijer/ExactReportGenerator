/** @jsx h */

import type { TransactionLine } from "../../deps.ts";

import { Fragment, h, render } from "../../deps.ts";
import QuickChart from "../util/QuickChart.ts";
import {
  aggregateTransactions,
  dailyAggregator,
  monthlyAggregator,
  SimpleTransaction,
} from "../services/transactions.ts";
import type { DateAggregator } from "../services/transactions.ts";

function getMonthList(firstDate: Date, lastDate: Date) {
  const firstDayOfMonths: Date[] = [];

  for (
    const d = new Date(firstDate.getTime());
    d <= lastDate;
    d.setUTCMonth(d.getUTCMonth() + 1)
  ) {
    firstDayOfMonths.push(new Date(d.setUTCDate(1)));
  }

  return firstDayOfMonths;
}

export async function renderAggregatedTransactionGraph(
  transactions: SimpleTransaction[][],
  title: string,
  aggregator: DateAggregator = "day",
) {
  if (!transactions.length || transactions.some((ts) => !ts.length)) {
    return render(
      <div class="warning">
        Zero transactions found in list.
      </div>,
    );
  }

  // FIXME: index is not the right way to shift years. It breaks when there is
  //        more than one year between two lists of transactions.
  const aggregated = transactions.map((ts, idx) =>
    aggregateTransactions(ts, aggregator, idx)
  );

  // Flatten and sort so we can find first and last dates.
  const flattend = aggregated.flat().sort((t1, t2) =>
    t1.date.getTime() - t2.date.getTime()
  );

  const monthList = getMonthList(
    flattend[0].date,
    flattend[flattend.length - 1].date,
  );

  const qc = new QuickChart<"line">({
    type: "line",
    data: {
      labels: monthList,
      datasets: aggregated.map((agg, idx) => ({
        type: "line",
        label: transactions[idx][0].FinancialYear.toString(),
        data: agg.map((d) => ({
          x: d.date.getTime(),
          y: d.cumulativeAmount,
        })),
        pointRadius: 0,
      })),
    },
    options: {
      title: {
        display: true,
        text: title,
      },
      legend: aggregated.length > 1 ? undefined : false,
      scales: {
        // @ts-ignore Types seem invalid.
        xAxes: [{
          type: "time",
          time: {
            unit: "month",
            displayFormats: {
              month: "MMM",
            },
          },
          ticks: {
            source: "labels",
            beginAtZero: 0,
          },
        }],
      },
    },
  });

  const svgData = await qc.getAsText();

  return render(
    <div class="svg-container" dangerouslySetInnerHTML={{ __html: svgData }}>
    </div>,
  );
}
