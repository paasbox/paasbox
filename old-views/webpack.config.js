const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
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
                loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader!sass-loader"})
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
        extensions: ['.js', '.jsx']
    }
};
