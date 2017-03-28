const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './index.js',
    output: {
        path: '../assets',
        filename: 'js/bundle.js',
        publicPath: 'http://localhost:8080/'
    },
    devtool: 'cheap-module-eval-source-map',
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            },
            {
                test: /\.jsx$/,
                loader: "eslint-loader"
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("css/main.css")
    ],
    eslint: {
        configFile: '.eslintrc.json'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
