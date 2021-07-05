import type { AccountTree } from "../deps.ts";
import { Site } from "../deps.ts";
import { renderClassification } from "./classification.tsx";

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
  // console.dir(site, { depth: 99 });

  site.helper("classification", async (dataFile, classification) => {
    const loader = site.source.data.get(".json");

    if (!loader) {
      throw new Error("Could not get json loader.");
    }

    if (
      typeof classification !== "string" && typeof classification !== "number"
    ) {
      throw new TypeError(
        "Classification's second argument is not a string (classification name) or a number (classification code).",
      );
    }

    const fileName = `_data/${dataFile}.json`;

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

    return "" + renderClassification(
      classification,
      data,
    );
  }, { type: "tag", async: true });
}
