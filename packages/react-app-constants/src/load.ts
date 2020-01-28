/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import { Base64 } from "js-base64";

const metaName = "app-constants";

export function loadConstants<T>(): T {
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    return loadConstantsFromMeta();
  }
  return loadConstantsFromEnv();
}

function loadConstantsFromMeta<T>(): T {
  const v = document
    .querySelector(`meta[name="${metaName}"]`)
    ?.getAttribute("content");
  if (v == null) {
    throw new Error(`meta[name="${metaName}"] is not found or has no contents`);
  }
  return JSON.parse(Base64.decode(v)) as T;
}

function loadConstantsFromEnv<T>(): T {
  const entries = Object.entries(process.env)
    .filter(([k, _]) => k.startsWith("REACT_APP_"))
    .map(([k, v]) => [k.replace(/^REACT_APP_/, ""), v]);
  return Object.fromEntries(entries) as T;
}
