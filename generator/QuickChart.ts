// Adapted from https://github.com/typpo/quickchart-js/blob/master/index.js

import type { ChartConfiguration, ChartType } from "../deps.ts";

const HOST = "https://quickchart.io";
const DEFAULT_DEVICE_PIXEL_RATIO = 1.0;
const DEFAULT_BACKGROUND_COLOR = "#ffffff";

const chartCache: Map<string, string> = new Map();

export default class QuickChart<T extends ChartType> {
  width = 500;
  height = 300;
  devicePixelRatio = DEFAULT_DEVICE_PIXEL_RATIO;
  backgroundColor = DEFAULT_BACKGROUND_COLOR;
  format: "svg" | "png" = "svg";

  constructor(
    protected config: ChartConfiguration<T>,
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

  async getAsText(): Promise<string> {
    const url = this.getUrl();
    const fromCache = chartCache.get(url.href);

    if (fromCache) {
      return Promise.resolve(fromCache);
    }

    const res = await fetch(this.getUrl());

    return res.text().then((text) => {
      chartCache.set(url.href, text);
      return text;
    });
  }
}
