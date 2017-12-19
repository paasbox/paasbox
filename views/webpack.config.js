const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './index.jsx',
    output: {
        path: path.resolve(__dirname, '../assets'),
        filename: 'js/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(jsx$|js$)/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {loader: "css-loader"},
                        {loader: "sass-loader"}
                    ],
                    fallback: "style-loader"
                })
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new ExtractTextPlugin("css/main.css"),
    ],
    devtool: "source-map"
};