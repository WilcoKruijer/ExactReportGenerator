import { Site } from "../deps.ts";
import { registerHelpers } from "./helpers/register_helpers.ts";

export let DEBUG = false;

/** This function is ran when the config is loaded. Can be used to register
 * custom filters, helpers, etc.
 */
export function main(site: Site): void {
  DEBUG = site.flags.some((f) => f.toLowerCase() === "debug");

  if (DEBUG) {
    console.log("[DEBUG] enabled!");
  }

  registerHelpers(site);

  site.addEventListener("beforeBuild", () => {
  });

  site.addEventListener("beforeUpdate", () => {
  });
}
