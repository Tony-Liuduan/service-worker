const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

class ServiceWorkerPlugin {
    apply(compiler) {
        compiler.hooks.emit.tap('ServiceWorkerPlugin', (compilation) => {
            const packageJson = fs.readFileSync(path.resolve(__dirname, './package.json'));
            const version = JSON.parse(packageJson).version;
            const assetKeys = Object.keys(compilation.assets);

            console.log(assetKeys);

            let source = compilation.assets['serviceworker.js'].source().toString()
            source = source.replace('self.__WEBPACK_INJECT_CACHE_LIST__', JSON.stringify(assetKeys))
            source = source.replace('self.__VERSION__', JSON.stringify(version))

            compilation.assets['serviceworker.js'] = {
                source: () => source,
                size: () => source.length
            }
        })
    }
}

module.exports = {
    entry: {
        main: './src/index.tsx',
        serviceworker: './src/serviceworker.js',
    },
    output: {
        path: path.resolve('dist'),
        publicPath: '/',
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|bower_components)/,
                include: path.resolve('src'),
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve(__dirname, './tsconfig.json')
                }
            },
            {
                test: /\.css?$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    }
                ]
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ServiceWorkerPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new WebpackBuildNotifierPlugin({
            title: 'Webpack Build Over',
            suppressSuccess: true
        }),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
    ],
    devServer: {
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true,
    }
};