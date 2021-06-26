import path from "path";
import glob from "glob";

module.exports = (_: void, argv: { mode: string }) => {
  const isDev = argv.mode == "development";
  return {
    entry: glob.sync("./src/*.ts").reduce((obj, current) => Object.assign(obj, { [path.basename(current, ".ts")]: current }), {}),
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
