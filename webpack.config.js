const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/index.html', to: 'index.html' }, // Copy the index.html file
        { from: 'public/style.css', to: 'style.css' }, // Copy the entire css folder
        { from: 'src/koi/segment.js', to: 'segment.js' },
        { from: 'src/koi/fish.js', to: 'fish.js' },
        { from: 'src/koi/feed.js', to: 'feed.js' },
        { from: 'src/koi/guide.js', to: 'guide.js' },
      ],
    }),
  ],
};
