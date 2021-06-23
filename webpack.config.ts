import path from "path";
import glob from "glob";

module.exports = (_: any, argv: any) => {
  const isDev = argv.mode == "development";
  return {
    entry: glob
      .sync("./src/*.ts")
      .reduce(
        (obj, current) =>
          Object.assign(obj, { [path.basename(current, ".ts")]: current }),
        {}
      ),
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
