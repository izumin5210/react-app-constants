import React from "react";
import { render } from "@testing-library/react";
import { Base64 } from "js-base64";
import "@testing-library/jest-dom/extend-expect";

import { createConstants } from "../src";

describe("react-app-constants", () => {
  describe("useConstants", () => {
    it("sets constant from initial props", () => {
      type Constants = {
        FOO: string;
      };
      const { useConstants, ConstantsProvider } = createConstants<Constants>();

      const initialConsts: Constants = {
        FOO: "barbaz",
      };

      const Printer: React.FC<{ name: keyof Constants }> = ({ name }) => (
        <p data-testid={name}>{useConstants()[name]}</p>
      );

      const { getByTestId } = render(
        <ConstantsProvider value={initialConsts}>
          <Printer name={"FOO"} />
        </ConstantsProvider>
      );

      expect(getByTestId("FOO")).toHaveTextContent("barbaz");
    });

    it("sets constant from DOM", () => {
      type Constants = {
        FOO: string;
      };
      const { useConstants, ConstantsProvider } = createConstants<Constants>();

      const initialConsts: Constants = {
        FOO: "barbaz",
      };

      const head = document.createElement("head");
      const meta = document.createElement("meta");
      head.appendChild(meta);
      meta.name = "app-constants";
      meta.content = Base64.encode(JSON.stringify(initialConsts));
      document.body.appendChild(head);
      const body = document.createElement("body");
      const container = document.createElement("div");
      body.appendChild(container);
      document.body.appendChild(body);

      const Printer: React.FC<{ name: keyof Constants }> = ({ name }) => (
        <p data-testid={name}>{useConstants()[name]}</p>
      );

      const { getByTestId } = render(
        <ConstantsProvider>
          <Printer name={"FOO"} />
        </ConstantsProvider>,
        { container }
      );

      expect(getByTestId("FOO")).toHaveTextContent("barbaz");
    });
  });

  describe("withConstants", () => {
    it("injects constants into inner component", () => {
      type Constants = {
        FOO: string;
      };
      const { withConstants, ConstantsProvider } = createConstants<Constants>();

      const initialConsts: Constants = {
        FOO: "barbaz",
      };

      const Printer: React.FC<{
        name: keyof Constants;
      } & Constants> = ({ name, ...rest }) => (
        <p data-testid={name}>{rest[name]}</p>
      );

      const WrappedPrinter = withConstants(Printer);

      const { getByTestId } = render(
        <ConstantsProvider value={initialConsts}>
          <WrappedPrinter name={"FOO"} />
        </ConstantsProvider>
      );

      expect(getByTestId("FOO")).toHaveTextContent("barbaz");
    });
  });
});
