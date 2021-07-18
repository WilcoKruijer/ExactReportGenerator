import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import markdown from "lume/plugins/markdown.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import inline from "lume/plugins/inline.ts";

import { main } from "./generator/main.ts";
import {
  markdownItAnchor,
  markdownItHeaderSections,
  markdownItTableOfContents,
} from "./deps.ts";

const site = lume();

site
  .ignore("README.md", "deps.ts", "import_map.json")
  .copy("static", ".")
  .copy("favicon.ico", "favicon.ico")
  .use(postcss())
  .use(terser())
  .use(date())
  .use(slugifyUrls({ alphanumeric: false }))
  .use(
    markdown({
      plugins: [
        markdownItHeaderSections,
        markdownItAnchor,
        [markdownItTableOfContents, {
          includeLevel: [2, 3],
        }],
      ],
    }),
  )
  .use(inline());

main(site);

export default site;
