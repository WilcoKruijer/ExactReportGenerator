/** @jsx h */

import type { ChartType } from "../../deps.ts";

import { h, render } from "../../deps.ts";
import QuickChart, { GenericDataset } from "../util/QuickChart.ts";
import { writeDebugFile } from "./helper_util.ts";

export interface GraphData<T extends ChartType> {
  labels: Date[];
  datasets: GenericDataset<T>;
}

export function getMonthList(firstDate: Date, lastDate: Date) {
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

export async function renderChart<T extends ChartType>(
  datasets: GenericDataset<T>,
  labels: unknown[],
  title: string,
) {
  const offset = datasets.some((d) => d.type === "bar");

  const qc = new QuickChart<T>({
    // @ts-ignore Types seem invalid
    type: "line",
    data: {
      labels: labels,
      datasets,
    },
    // @ts-ignore Types seem invalid
    options: {
      title: {
        display: true,
        text: title,
      },
      legend: datasets.length > 1 ? undefined : false,
      scales: {
        xAxes: [{
          type: "time",
          offset,
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

  writeDebugFile(`chart_${title}.json`, qc.config);

  const svgData = await qc.getAsText();

  return render(
    <div class="svg-container" dangerouslySetInnerHTML={{ __html: svgData }}>
    </div>,
  );
}
