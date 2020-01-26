import HtmlWebpackPlugin from "html-webpack-plugin";
import { createFsFromVolume, Volume } from "memfs";
import { join } from "path";
import webpack from "webpack";
import { config as globalConfig, rewire } from "../src";

const outputPath = join(__dirname, "..", "dist");

function setup(): {
  fs: webpack.OutputFileSystem;
  createDotenv: (variation: string, pairs: string[]) => void;
  expectToMatchSnapshot: (filename: string) => void;
} {
  const vol = new Volume();
  const fs = createFsFromVolume(vol);

  globalConfig.dir = "/app";
  globalConfig.fs = {
    readFileSync: path => fs.readFileSync(path) as Buffer,
  };
  fs.mkdirpSync(globalConfig.dir);

  const { mkdir, mkdirp, rmdir, unlink, writeFile } = fs;
  return {
    fs: { mkdir, mkdirp, rmdir, unlink, writeFile, join },
    createDotenv: (variation, pairs) => {
      fs.writeFileSync(
        join(globalConfig.dir, `.env.${variation}`),
        pairs.join("\n")
      );
    },
    expectToMatchSnapshot: filename => {
      expect(
        fs.readFileSync(join(outputPath, filename), "utf-8")
      ).toMatchSnapshot(filename);
    },
  };
}

describe("webpack-html-powerstrip", () => {
  it("generates multiple htmls", done => {
    const { fs, createDotenv, expectToMatchSnapshot } = setup();
    createDotenv("qa", [
      "REACT_APP_NODE_ENV=qa",
      'MESSAGE="This is QA"',
      'REACT_APP_SECRET="foobarbaz"',
    ]);
    createDotenv("staging", [
      "REACT_APP_NODE_ENV=stating",
      'MESSAGE="This is Staging"',
      'REACT_APP_SECRET="barbazfoo"',
    ]);
    createDotenv("production", [
      "REACT_APP_NODE_ENV=production",
      'MESSAGE="This is Production"',
      'REACT_APP_SECRET="bazfoobar"',
    ]);
    const config: webpack.Configuration = {
      entry: {
        main: join(__dirname, "__fixtures__", "entry.js"),
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
      }),
      (err, _) => {
        expect(err).toBeNull();
        expectToMatchSnapshot("index.qa.html");
        expectToMatchSnapshot("index.staging.html");
        expectToMatchSnapshot("index.production.html");
        done();
      }
    ) as webpack.Compiler;
    compiler.outputFileSystem = fs;
  });
});
