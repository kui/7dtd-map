import path from "path";
import glob from "glob";

const BASE_DIR = path.resolve("src");

module.exports = (_: void, argv: { mode: string }) => {
  const isDev = argv.mode == "development";

  const entry = glob.sync(path.join(BASE_DIR, "{,worker}", "*.ts")).reduce((obj, p) => {
    const name = path.relative(BASE_DIR, p).replace(/\.ts$/, "");
    console.log(name);
    return Object.assign(obj, { [name]: p });
  }, {});

  return {
    entry,
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "docs"),
    },
    devtool: isDev ? "inline-source-map" : "source-map",
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            //configFile: "src/tsconfig.json",
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    performance: {
      hints: false,
    },
  };
};
