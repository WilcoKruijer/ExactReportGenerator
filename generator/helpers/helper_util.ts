import { extname } from "../../deps.ts";
import site from "../../_config.ts";

export interface HelperOptions {
  /** Path to json report file */
  report: string;
  /** Path to json budget file */
  budget?: string;
}

export function isHelperOptions(options: unknown): options is HelperOptions {
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

export function validateClassificationId(
  id: unknown,
): asserts id is string | number {
  if (
    typeof id !== "string" && typeof id !== "number"
  ) {
    throw new TypeError(
      "Classification's second argument is not a string (classification name) or a number (classification code).",
    );
  }
}

export async function getDataFile<T>(
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
