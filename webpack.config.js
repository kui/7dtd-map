const webpack = require('webpack')
const path = require('path');
const glob = require('glob');

const entries = glob
  .sync('./js/*.js')
  .reduce((obj, current) => Object.assign(obj, { [path.basename(current)]: current }), {});

module.exports = {
  entry: entries,
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'docs'),
  },
  plugins: [
    new webpack.ProvidePlugin({
      // https://github.com/browserify/node-util/issues/43#issuecomment-724353093
      process: 'process/browser',
      // https://github.com/webpack/changelog-v5/issues/10#issuecomment-615877593
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    fallback: {
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
    },
  },
};
