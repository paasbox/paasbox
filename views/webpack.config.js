const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: '../assets',
        filename: 'js/bundle.js',
        publicPath: 'http://localhost:8080/'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("css/main.css"),
        new CopyWebpackPlugin([
            { from: 'images', to: 'images' }
        ])
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
