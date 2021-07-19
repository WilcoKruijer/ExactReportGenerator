import { Site } from "../../deps.ts";
import { formatNumberOptions, locale } from "../constants.ts";
import { lineHelper } from "./line.ts";
import { barHelper } from "./bar.ts";
import { classificationHelper } from "./classification.ts";
import { aggregateHelper } from "./aggregate.ts";
import { chartHelper } from "./chart.ts";
import { balanceHelper } from "./balance.tsx";
import { loadDataHelper } from "./data.ts";

export function registerHelpers(site: Site): void {
  // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then,
  site.helper("load", loadDataHelper, { type: "filter", async: true });

  site.filter("euro", (n: unknown) => {
    if (typeof n === "number") {
      const s = n.toLocaleString(locale, formatNumberOptions).replace(
        ",00",
        ",-",
      );
      return "€" + s;
    }

    return "€" + n;
  });

  site.filter(
    "line",
    // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then.
    lineHelper,
  );

  site.helper(
    "chart",
    // @ts-ignore FIXME: generic type of helper function is not setup properly.
    chartHelper,
    { type: "filter", async: true },
  );

  site.helper(
    "bar",
    // @ts-ignore idem.
    barHelper,
    { type: "filter", async: true },
  );

  site.filter(
    "aggregate",
    // @ts-ignore helper types will be relaxed in the next version of Lume, we can remove this then.
    aggregateHelper,
  );

  site.helper(
    "classification",
    classificationHelper,
    { type: "tag", async: true },
  );

  site.helper(
    "balance",
    balanceHelper,
    { type: "tag", async: true },
  );
}
