const path = require('path');
const glob = require('glob');
const { argv } = require('process');

const entries = glob
  .sync('./src/*.ts')
  .reduce((obj, current) => Object.assign(obj, { [path.basename(current, '.ts')]: current }), {});

const isDev = argv.mode == 'development';

module.exports = {
  entry: entries,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'docs'),
  },
  devtool: isDev ? 'inline-source-map' : 'source-map',
  module: {
    rules: [
      { 
        test: /\.ts$/, 
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
       },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  performance: {
    hints: false,
  },
};
