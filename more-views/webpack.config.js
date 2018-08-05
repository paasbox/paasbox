const path = require('path');

console.log(`Build: ${process.env.NODE_ENV}`);

module.exports = {
    entry: './index.tsx',
    output: {
        filename: 'js/new-main.js',
        path: path.resolve(__dirname, '../assets')
    },
    devtool: process.env.NODE_ENV === 'production' ? "source-map" : "eval-cheap-module-source-map",
    module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: ['babel-loader','ts-loader']
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader'
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          }
        ]
      },
    resolve: { extensions: ['*', '.js', '.jsx', '.ts', '.tsx'] }
};
