import { AccountTree, ChartType, extname } from "../deps.ts";
import { Site } from "../deps.ts";
import site from "../_config.ts";
import { renderBalance } from "./helpers/balance.tsx";
import { renderProfitLoss } from "./helpers/profit_loss.tsx";
import { getMonthList, GraphData, renderChart } from "./helpers/graphing.tsx";
import {
  aggregateTransactions,
  CumulativeTransaction,
  isDateAggregator,
  isSimpleTransactionArray,
} from "./services/transactions.ts";
import { YearlyBudgetScenarioValue } from "./services/budget.ts";
import { formatNumberOptions, locale } from "./constants.ts";

/** This function is ran when the config is loaded. Can be used to register
 * custom filters, helpers, etc.
 */
export function main(site: Site): void {
  registerHelpers(site);
  console.log("Registering...");

  site.addEventListener("beforeBuild", () => {
  });

  site.addEventListener("beforeUpdate", () => {
  });
}

export interface HelperOptions {
  /** Path to json report file */
  report: string;
  /** Path to json budget file */
  budget?: string;
}

async function classificationHelper(classification: unknown, options: unknown) {
  validateClassificationId(classification);

  if (!isHelperOptions(options)) {
    throw new TypeError("Invalid option object given.");
  }

  const report = await getDataFile<AccountTree>(options.report);
  const budget = options.budget
    ? await getDataFile<YearlyBudgetScenarioValue[]>(
      options.budget,
    )
    : undefined;

  return renderProfitLoss(
    classification,
    report,
    budget,
  );
}

async function balanceHelper(
  classificationLeft: unknown,
  classificationRight: unknown,
  options: unknown,
) {
  validateClassificationId(classificationLeft);
  validateClassificationId(classificationRight);

  if (!isHelperOptions(options)) {
    throw new TypeError("Invalid option object given.");
  }

  const report = await getDataFile<AccountTree>(options.report);

  return renderBalance(
    classificationLeft,
    classificationRight,
    report,
  );
}

function loadDataHelper(file: unknown) {
  if (typeof file !== "string") {
    throw new TypeError("Invalid data file given.");
  }

  return getDataFile<unknown>(file);
}

function aggregateHelper(transactions: unknown, aggregator: unknown = "day") {
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

function lineHelper(transactions: CumulativeTransaction[]): GraphData<"line"> {
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

function barHelper(transactions: CumulativeTransaction[]): GraphData<"bar"> {
  // TODO: fill in empty months
  // TODO: fix multiple bar dataset in one chart.
  return {
    labels: transactions.map((t) => t.date),
    datasets: [{
      type: "bar",
      label: transactions[0].date.getFullYear().toString(),
      data: transactions.map((d) => d.amount),
    }],
  };
}

function chartHelper<T extends ChartType>(
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

function registerHelpers(site: Site): void {
  // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then,
  site.helper("load", loadDataHelper, { type: "filter", async: true });

  site.filter("euro", (n: unknown) => {
    if (typeof n === "number") {
      return `€${
        n.toLocaleString(locale, formatNumberOptions).replace(",00", ",-")
      }`;
    }

    return "€" + n;
  });

  site.filter(
    "line",
    // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then.
    lineHelper,
  );

  site.helper(
    "chart",
    // @ts-ignore FIXME: generic type of helper function is not setup properly.
    chartHelper,
    { type: "filter", async: true },
  );

  site.helper(
    "bar",
    // @ts-ignore idem.
    barHelper,
    { type: "filter", async: true },
  );

  site.filter(
    "aggregate",
    // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then.
    aggregateHelper,
  );

  site.helper(
    "classification",
    classificationHelper,
    { type: "tag", async: true },
  );

  site.helper(
    "balance",
    balanceHelper,
    { type: "tag", async: true },
  );
}

function isHelperOptions(options: unknown): options is HelperOptions {
  function isPartialHelperOptions(
    options: unknown,
  ): options is Partial<Record<keyof HelperOptions, unknown>> {
    return typeof options === "object" && options !== null;
  }

  return (
    isPartialHelperOptions(options) &&
    typeof options.report === "string" &&
    (typeof options.budget === "string" ||
      typeof options.budget === "undefined")
  );
}

function validateClassificationId(id: unknown): asserts id is string | number {
  if (
    typeof id !== "string" && typeof id !== "number"
  ) {
    throw new TypeError(
      "Classification's second argument is not a string (classification name) or a number (classification code).",
    );
  }
}

async function getDataFile<T>(
  dataPath: string,
): Promise<T> {
  const loader = site.source.data.get(".json");

  if (!loader) {
    throw new Error("Could not get json loader.");
  }

  const ext = extname(dataPath) === ".json" ? "" : ".json";
  const fileName = `_data/${dataPath}${ext}`;

  let data;
  try {
    data = await loader(
      fileName,
    ) as unknown as T;
  } catch {
    throw new Error(
      `Could not find data file '${fileName}'. Does this file exist in the _data folder?`,
    );
  }

  return data;
}
