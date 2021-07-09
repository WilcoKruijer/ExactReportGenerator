import { AccountTree, extname } from "../deps.ts";
import { Site } from "../deps.ts";
import { renderBalance } from "./balance.tsx";
import { renderProfitLoss } from "./profit_loss.tsx";
import { YearlyBudgetScenarioValue } from "./types.d.ts";

/** This function is ran when the config is loaded. Can be used to register
 * custom filters, helpers, etc.
 */
export function main(site: Site): void {
  registerHelpers(site);
  console.log("Registering...");

  site.addEventListener("beforeBuild", () => {
  });

  site.addEventListener("beforeUpdate", (_event) => {
  });
}

export interface HelperOptions {
  /** Path to json report file */
  report: string;
  /** Path to json budget file */
  budget?: string;
}

function registerHelpers(site: Site): void {
  site.helper("classification", async (classification, options) => {
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
  }, { type: "tag", async: true });

  site.helper(
    "balance",
    async (classificationLeft, classificationRight, options) => {
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
