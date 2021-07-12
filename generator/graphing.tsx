/** @jsx h */

import type { TransactionLine } from "../deps.ts";

import { Fragment, h, render } from "../deps.ts";
import QuickChart from "./QuickChart.ts";
import {
  aggregateTransactions,
  dailyAggregator,
  monthlyAggregator,
} from "./transactions.ts";
import type { DateAggregator } from "./transactions.ts";

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
  transactions: TransactionLine[],
  aggregation: DateAggregator = "day",
) {
  if (!transactions.length) {
    return render(
      <div class="warning">
        Zero transactions found in list.
      </div>,
    );
  }

  const aggregator = aggregation === "day"
    ? dailyAggregator
    : monthlyAggregator;

  const aggregated = aggregateTransactions(transactions, aggregator);

  const monthList = getMonthList(
    aggregated[0].date,
    aggregated[aggregated.length - 1].date,
  );

  const qc = new QuickChart<"line">({
    type: "line",
    data: {
      labels: monthList,

      datasets: [{
        data: aggregated.map((d) => ({
          x: d.date.getTime(),
          y: d.cumulativeAmount,
        })),
        pointRadius: 0,
      }],
    },
    options: {
      title: {
        display: true,
        text: transactions[0].GLAccountDescription,
      },
      legend: false,
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
