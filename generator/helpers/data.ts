import { getDataFile } from "./helper_util.ts";

export function loadDataHelper(file: unknown) {
  if (typeof file !== "string") {
    throw new TypeError("Invalid data file given.");
  }

  return getDataFile<unknown>(file);
}
