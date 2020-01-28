/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import deepmerge from "deepmerge";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as Webpack from "webpack";

export type Overrider = (variant?: string) => HtmlWebpackPlugin.Options;

export interface Params {
  variants: string[];
  overrider: Overrider;
}

export default class WebpackHtmlPowerstrip {
  private variants: string[];
  private overrider: Overrider;

  constructor({ variants, overrider }: Params) {
    this.variants = variants;
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
      for (const variant of this.variants) {
        config.plugins.push(
          this.createHtmlWebpackPlugin(basePlugin, variant)
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

  private createHtmlWebpackPlugin(base: Webpack.Plugin, variant?: string) {
    return this.cloneHtmlWebpackPlugin(base, {
      filename: variant == null ? "index.html" : `index.${variant}.html`,
      ...this.overrider(variant),
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
