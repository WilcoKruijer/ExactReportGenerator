import type { AccountTree } from "../deps.ts";
import { Site } from "../deps.ts";
import { renderBalance } from "./balance.tsx";
import { renderProfitLoss } from "./profit_loss.tsx";

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

function registerHelpers(site: Site): void {
  site.helper("classification", async (dataFile, classification) => {
    validateClassificationId(classification);

    const data = await getDataFile(site, dataFile);

    return renderProfitLoss(
      classification,
      data,
    );
  }, { type: "tag", async: true });

  site.helper(
    "balance",
    async (dataFile, classificationLeft, classificationRight) => {
      validateClassificationId(classificationLeft);
      validateClassificationId(classificationRight);

      const data = await getDataFile(site, dataFile);

      return renderBalance(
        classificationLeft,
        classificationRight,
        data,
      );
    },
    { type: "tag", async: true },
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

async function getDataFile(
  site: Site,
  dataFilePath: unknown,
): Promise<AccountTree> {
  const loader = site.source.data.get(".json");

  if (!loader) {
    throw new Error("Could not get json loader.");
  }

  const fileName = `_data/${dataFilePath}.json`;

  let data;
  try {
    data = await loader(
      fileName,
    ) as unknown as AccountTree;
  } catch {
    throw new Error(
      `Could not find data file '${fileName}'. Does this file exist in the _data folder?`,
    );
  }

  return data;
}
