import { Site } from "../deps.ts";
import { registerHelpers } from "./helpers/register_helpers.ts";

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
