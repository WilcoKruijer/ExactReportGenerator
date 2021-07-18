// Adapted from https://github.com/typpo/quickchart-js/blob/master/index.js

import { ChartConfiguration, ChartType, uuidv4 } from "../../deps.ts";

// From https://stackoverflow.com/a/64776616
type First<T extends unknown[]> = T extends [infer U, ...unknown[]] ? U : never;
type Rest<T extends unknown[]> = T extends [unknown, ...infer U] ? U : never;

export type Drill<T, Path extends unknown[]> = First<Path> extends never ? T
  : First<Path> extends keyof T ? Drill<T[First<Path>], Rest<Path>>
  : never;

export type GenericDataset<T extends ChartType> = Drill<
  ChartConfiguration<T>,
  ["data", "datasets"]
>;

const HOST = "https://quickchart.io";
const DEFAULT_DEVICE_PIXEL_RATIO = 1.0;
const DEFAULT_BACKGROUND_COLOR = "#ffffff";

const chartCache: Map<string, Promise<string>> = new Map();

export default class QuickChart<T extends ChartType> {
  width = 500;
  height = 300;
  devicePixelRatio = DEFAULT_DEVICE_PIXEL_RATIO;
  backgroundColor = DEFAULT_BACKGROUND_COLOR;
  format: "svg" | "png" = "svg";

  constructor(
    public config: ChartConfiguration<T>,
    protected apiKey?: string,
    protected accountId?: string,
  ) {
  }

  getUrl() {
    const url = new URL(`${HOST}/chart`);
    url.searchParams.append("c", JSON.stringify(this.config));
    url.searchParams.append("w", this.width.toString());
    url.searchParams.append("h", this.height.toString());
    url.searchParams.append("f", this.format);

    if (this.devicePixelRatio !== DEFAULT_DEVICE_PIXEL_RATIO) {
      url.searchParams.append(
        "devicePixelRatio",
        this.devicePixelRatio.toString(),
      );
    }

    if (this.backgroundColor !== DEFAULT_BACKGROUND_COLOR) {
      url.searchParams.append("bkg", this.backgroundColor.toString());
    }

    return url;
  }

  /** It is necessary to rename ids because multiple charts can have
   * overlapping ids which breaks their rendering in browsers.
   */
  renameIds(svg: string): string {
    const idRegex = /id="(clip\d)"/gi;

    const matches = svg.matchAll(idRegex);

    for (const [, id] of matches) {
      svg = svg.replaceAll(id, id + uuidv4.generate());
    }

    return svg;
  }

  async getAsText(): Promise<string> {
    const url = this.getUrl();
    const fromCache = chartCache.get(url.href);

    if (fromCache) {
      return Promise.resolve(fromCache);
    }

    const res = await fetch(this.getUrl());
    const textPromise = res.text().then(this.renameIds);
    chartCache.set(url.href, textPromise);
    return textPromise;
  }
}
