/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import dotenv from "dotenv";
import * as fs from "fs";
import { Base64 } from "js-base64";
import { join } from "path";
import webpack from "webpack";
import { Overrider, rewire as rewireToPowerstrip } from "webpack-html-powerstrip";

interface GlobalConfig {
  dir: string;
  fs: Pick<webpack.InputFileSystem, "readFileSync">;
}

export const config: GlobalConfig = {
  dir: fs.realpathSync(process.cwd()),
  fs,
};

export interface Params {
  variants: string[];
  loader?: Loader;
  transformers?: Transformer[];
}

export function rewire(
  config: webpack.Configuration,
  env: string,
  { loader = loadFromDotenv, transformers = [onlyReactApp], variants }: Params
) {
  const overrider = createOverrider(loader, transformers);
  return rewireToPowerstrip(config, env, {
    variants,
    overrider,
  });
}

type Constants = [string, string][];
type Loader = (variant?: string) => Constants;
type Transformer = (consts: Constants, variant?: string) => Constants;

function createOverrider(load: Loader, transformers: Transformer[]): Overrider {
  return (variant?: string) => {
    let entries = load(variant);
    for (const f of transformers) {
      entries = f(entries);
    }
    const cfg = Object.fromEntries(entries);

    const meta = { "app-constants": Base64.encode(JSON.stringify(cfg)) };
    return { meta };
  };
}

const loadFromDotenv: Loader = variant => {
  const path = join(
    config.dir,
    variant == null ? ".env" : `.env.${variant}`
  );
  const cfg = dotenv.parse(config.fs.readFileSync(path)) || {};
  return Object.entries(cfg);
};

const onlyReactApp: Transformer = (consts, _) =>
  consts
    .filter(([k, _]) => k.startsWith("REACT_APP_"))
    .map(([k, v]) => [k.replace(/^REACT_APP_/, ""), v]);
