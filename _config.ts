import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";

import { main } from "./generator/main.ts";

const site = lume();

site
  .ignore("README.md", "deps.ts", "import_map.json")
  .copy("static", ".")
  .use(postcss())
  .use(terser())
  .use(date())
  .use(slugifyUrls({ alphanumeric: false }));

main(site);

export default site;
