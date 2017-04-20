const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: ['transform-thea-jsx'],
          presets: ['env'],
        },
      },
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        loader: 'css-loader?importLoaders=1,modules=true!postcss-loader',
      }),
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new ExtractTextPlugin('[name].bundle.css'),
  ],
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src'),
    ],
  },
};
