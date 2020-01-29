/* eslint eqeqeq: ["error", "always", {"null": "ignore"}] */

import React, { createContext, useContext } from "react";
import { loadConstants } from "./load";

type Context<T> = React.Context<T | null>;
type Provider<T> = React.FC<{ value?: T; loader?: () => T }>;
type HOC<T> = <P>(Wrapped: React.ComponentType<P & T>) => React.FC<P>;

export function createConstants<T>(): {
  ConstantsContext: Context<T>;
  ConstantsProvider: Provider<T>;
  useConstants: () => T;
  withConstants: HOC<T>;
} {
  const ConstantsContext = createContext<T | null>(null);
  const useConstants = createHook(ConstantsContext);

  return {
    ConstantsContext,
    ConstantsProvider: createProvider(ConstantsContext),
    useConstants,
    withConstants: createHOC(useConstants),
  };
}

function createProvider<T>(ctx: Context<T>) {
  const ConstantsProvider: Provider<T> = ({
    children,
    value,
    loader = loadConstants,
  }) => <ctx.Provider value={value || loader()}>{children}</ctx.Provider>;
  return ConstantsProvider;
}

function createHook<T>(ctx: Context<T>): () => T {
  return () => {
    const consts = useContext(ctx);
    if (consts == null) {
      throw Error("constans is not loaded");
    }
    return consts;
  };
}

function createHOC<T>(useConstants: () => T) {
  return function<P>(Wrapped: React.ComponentType<P & T>) {
    const Constants: React.FC<P> = props => (
      <Wrapped {...{ ...props, ...useConstants() }} />
    );
    return Constants;
  };
}
