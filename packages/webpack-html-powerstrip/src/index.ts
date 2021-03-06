import * as webpack from "webpack";
import WebpackHtmlPowerstrip, {
  Overrider,
  Params,
} from "./WebpackHtmlPowerstrip";

function rewire(
  config: webpack.Configuration,
  env: string,
  params: Params
): webpack.Configuration {
  return new WebpackHtmlPowerstrip(params).rewire(config, env);
}

export { WebpackHtmlPowerstrip, rewire, Params, Overrider };
