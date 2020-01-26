/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import deepmerge from "deepmerge";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as Webpack from "webpack";

export type Overrider = (variation?: string) => HtmlWebpackPlugin.Options;

export interface Params {
  variations: string[];
  overrider: Overrider;
}

export default class WebpackHtmlPowerstrip {
  private variations: string[];
  private overrider: Overrider;

  constructor({ variations, overrider }: Params) {
    this.variations = variations;
    this.overrider = overrider;
  }

  public rewire(
    config: Webpack.Configuration,
    env: string
  ): Webpack.Configuration {
    if (config.plugins == null) {
      return config;
    }

    const basePlugin = this.popHtmlWebpackPlugin(config);
    if (basePlugin == null) {
      return config;
    }

    if (env === "production") {
      for (const variation of this.variations) {
        config.plugins.push(
          this.createHtmlWebpackPlugin(basePlugin, variation)
        );
      }
    } else {
      config.plugins.push(this.createHtmlWebpackPlugin(basePlugin));
    }

    return config;
  }

  private popHtmlWebpackPlugin(
    config: Webpack.Configuration
  ): Webpack.Plugin | null {
    let plugin = null;

    config.plugins = (config.plugins || []).filter(p => {
      if (p.constructor.name !== "HtmlWebpackPlugin") {
        return true;
      }
      plugin = p;
      return false;
    });

    return plugin;
  }

  private createHtmlWebpackPlugin(base: Webpack.Plugin, variation?: string) {
    return this.cloneHtmlWebpackPlugin(base, {
      filename: variation == null ? "index.html" : `index.${variation}.html`,
      ...this.overrider(variation),
    });
  }

  private cloneHtmlWebpackPlugin(
    base: Webpack.Plugin,
    override: HtmlWebpackPlugin.Options
  ) {
    const plugin = Object.assign(
      Object.create(Object.getPrototypeOf(base)),
      base
    );
    plugin.options = deepmerge(plugin.options, override);
    return plugin;
  }
}
