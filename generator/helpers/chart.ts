import type { ChartType } from "../../deps.ts";
import { GraphData, renderChart } from "./graphing.tsx";

export function chartHelper<T extends ChartType>(
  data: GraphData<T> | GraphData<T>[],
  title = "Graph",
) {
  if (!Array.isArray(data)) {
    data = [data];
  }

  let mostLabels = data[0].labels;
  for (const d of data) {
    if (d.labels.length > mostLabels.length) {
      mostLabels = d.labels;
    }
  }

  const originalYear = mostLabels[0].getFullYear();

  // Adjusts the year so the graphs overlap eachother.
  for (const secondaryData of data) {
    for (const dataset of secondaryData.datasets) {
      for (const dataPoint of dataset.data) {
        if (dataPoint && typeof dataPoint === "object" && "x" in dataPoint) {
          dataPoint.x = new Date(dataPoint.x).setFullYear(originalYear);
        }
      }
    }
  }

  return renderChart(
    data.flatMap((d) => d.datasets),
    mostLabels,
    title,
  );
}
