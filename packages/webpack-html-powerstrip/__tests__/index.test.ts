import HtmlWebpackPlugin from "html-webpack-plugin";
import { fs } from "memfs";
import * as path from "path";
import webpack from "webpack";
import { rewire } from "../src";

const outputPath = path.join(__dirname, "..", "dist");

function createFs(): webpack.OutputFileSystem {
  const { mkdir, mkdirp, rmdir, unlink, writeFile } = fs;
  return { mkdir, mkdirp, rmdir, unlink, writeFile, join: path.join };
}

function readOutput(filename: string): string {
  return fs.readFileSync(path.join(outputPath, filename), "utf-8").toString();
}

function expectToMatchSnapshot(filename: string) {
  expect(readOutput(filename)).toMatchSnapshot(filename);
}

describe("webpack-html-powerstrip", () => {
  it("generates multiple htmls", done => {
    const config: webpack.Configuration = {
      entry: {
        main: path.join(__dirname, "__fixtures__", "entry.js"),
      },
      output: {
        path: outputPath,
        filename: "[name].js",
      },
      plugins: [new HtmlWebpackPlugin()],
    };
    const compiler = webpack(
      rewire(config, "production", {
        variations: ["qa", "staging", "production"],
        overrider: (v?: string): HtmlWebpackPlugin.Options => {
          const _ = v;
          return {};
        },
      }),
      (err, _) => {
        expect(err).toBeNull();
        expectToMatchSnapshot("index.qa.html");
        expectToMatchSnapshot("index.staging.html");
        expectToMatchSnapshot("index.production.html");
        done();
      }
    ) as webpack.Compiler;
    compiler.outputFileSystem = createFs();
  });
});
