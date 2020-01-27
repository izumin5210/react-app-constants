/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import { Base64 } from "js-base64";
import React, { createContext, useContext, Context } from "react";

const metaName = "app-constants";

export function createConstantsContext<T>(): {
  context: Context<T | null>;
  useConstants: () => T;
  ConstantsProvider: React.FC<{ value?: T; loader?: () => T }>;
} {
  const context = createContext<T | null>(null);
  const useConstants = createHook(context);

  const ConstantsProvider: React.FC<{ value?: T; loader?: () => T }> = ({
    children,
    value,
    loader = loadConstants,
  }) => (
    <context.Provider value={value || loader()}>{children}</context.Provider>
  );

  return { context, ConstantsProvider, useConstants };
}

function createHook<T>(ctx: Context<T | null>): () => T {
  return () => {
    const consts = useContext(ctx);
    if (consts == null) {
      throw Error("constans is not loaded");
    }
    return consts;
  };
}

function loadConstants<T>(): T {
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
