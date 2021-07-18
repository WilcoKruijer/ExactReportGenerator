import { AccountTree, extname, TransactionLine } from "../deps.ts";
import { Site } from "../deps.ts";
import { renderBalance } from "./helpers/balance.tsx";
import { renderProfitLoss } from "./helpers/profit_loss.tsx";
import { renderAggregatedTransactionGraph } from "./helpers/graphing.tsx";
import { isDateAggregator } from "./services/transactions.ts";
import { YearlyBudgetScenarioValue } from "./services/budget.ts";

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

function registerHelpers(site: Site): void {
  site.helper(
    "classification",
    async (classification: unknown, options: unknown) => {
      validateClassificationId(classification);

      if (!isHelperOptions(options)) {
        throw new TypeError("Invalid option object given.");
      }

      const report = await getDataFile<AccountTree>(site, options.report);
      const budget = options.budget
        ? await getDataFile<YearlyBudgetScenarioValue[]>(
          site,
          options.budget,
        )
        : undefined;

      return renderProfitLoss(
        classification,
        report,
        budget,
      );
    },
    { type: "tag", async: true },
  );

  site.helper(
    "balance",
    async (
      classificationLeft: unknown,
      classificationRight: unknown,
      options: unknown,
    ) => {
      validateClassificationId(classificationLeft);
      validateClassificationId(classificationRight);

      if (!isHelperOptions(options)) {
        throw new TypeError("Invalid option object given.");
      }

      const report = await getDataFile<AccountTree>(site, options.report);

      return renderBalance(
        classificationLeft,
        classificationRight,
        report,
      );
    },
    { type: "tag", async: true },
  );

  site.helper(
    "transactions",
    async (fileOrFiles: unknown, dateAggregator: unknown = "day") => {
      if (typeof fileOrFiles !== "string" && !isStringArray(fileOrFiles)) {
        throw new TypeError("Invalid transaction file(s) given.");
      }

      const fileNames = isStringArray(fileOrFiles)
        ? fileOrFiles
        : [fileOrFiles];

      if (!isDateAggregator(dateAggregator)) {
        throw new TypeError("Invalid dateAggregator given.");
      }

      const transactions = await Promise.all(
        fileNames.map((f) => getDataFile<TransactionLine[]>(site, f)),
      );

      return await renderAggregatedTransactionGraph(
        transactions,
        dateAggregator,
      );
    },
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

function isStringArray(arr: unknown): arr is Array<string> {
  if (!Array.isArray(arr)) {
    return false;
  }

  return !arr.some((a) => typeof a !== "string");
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
  site: Site,
  reportPath: string,
): Promise<T> {
  const loader = site.source.data.get(".json");

  if (!loader) {
    throw new Error("Could not get json loader.");
  }

  const ext = extname(reportPath) === ".json" ? "" : ".json";
  const fileName = `_data/${reportPath}${ext}`;

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
