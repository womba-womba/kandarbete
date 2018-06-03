const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/index.js',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: [/node_modules/, /server/],
      //   use: {
      //     loader: 'babel-loader'
      //   },
      // },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(gif|svg|jpg|png|ttf|woff|woff2|eot)$/,
        loader: "file-loader",
      },
      {
        test: /\.(tsx|js)?$/,
        use: ['ts-loader'],
        exclude: [/node_modules/, /server/]
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html'
    })
  ]
};
