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
      {
        test: /\.(wav|ogg|mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'sounds/', // Output folder for the bundled .wav files
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/index.html', to: 'index.html' }, // Copy the index.html file
        { from: 'public/style.css', to: 'style.css' }, // Copy the entire css folder
      ],
    }),
  ],
};
