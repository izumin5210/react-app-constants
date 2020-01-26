/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import dotenv from "dotenv";
import { Base64 } from "js-base64";
import webpack from "webpack";
import {
  Overrider,
  rewire as rewireToPowerstrip,
} from "webpack-html-powerstrip";

export interface Params {
  variations: string[];
  loader?: Loader;
  transformers?: Transformer[];
}

export function rewire(
  config: webpack.Configuration,
  env: string,
  { loader = loadFromDotenv, transformers = [onlyReactApp], variations }: Params
) {
  const overrider = createOverrider(loader, transformers);
  return rewireToPowerstrip(config, env, {
    variations,
    overrider,
  });
}

type Constants = [string, string][];
type Loader = (variation?: string) => Constants;
type Transformer = (consts: Constants, variation?: string) => Constants;

function createOverrider(load: Loader, transformers: Transformer[]): Overrider {
  return (variation?: string) => {
    let entries = load(variation);
    for (const f of transformers) {
      entries = f(entries);
    }
    const cfg = Object.fromEntries(entries);

    return { "app-constants": Base64.encode(JSON.stringify(cfg)) };
  };
}

const loadFromDotenv: Loader = variation => {
  const { parsed } = dotenv.config({
    path: variation == null ? ".env" : `.env.${variation}`,
  });
  return Object.entries(parsed || {});
};

const onlyReactApp: Transformer = (consts, _) =>
  consts
    .filter(([k, _]) => k.startsWith("REACT_APP_"))
    .map(([k, v]) => [k.replace(/^REACT_APP_/, ""), v]);
