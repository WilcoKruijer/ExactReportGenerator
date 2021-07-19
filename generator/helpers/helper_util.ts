import { dirname, ensureDirSync, extname, join, sep } from "../../deps.ts";
import site from "../../_config.ts";
import { DEBUG } from "../main.ts";

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

export function writeDebugFile(
  fileName: string,
  data: unknown,
  format = true,
) {
  if (!DEBUG) {
    return;
  }

  if (!fileName) {
    throw new TypeError("Empty fileName given.");
  }

  if (fileName.split(sep)[0] !== "_debug") {
    fileName = join("_debug", fileName);
  }

  ensureDirSync(dirname(fileName));

  if (extname(fileName) !== ".json") {
    fileName += ".json";
  }

  // Remove all spaces
  fileName = fileName.replace(/\s/g, "_");

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(
    JSON.stringify(data, null, format ? 2 : undefined),
  );

  Deno.writeFileSync(fileName, encodedData);

  console.debug(
    `[DEBUG] Written file to: '${fileName}'`,
  );
}
