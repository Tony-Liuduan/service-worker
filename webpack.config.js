const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
// const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');

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
        // new GenerateSW({
        //     swDest: 'serviceworker.js', // 注意点1: 不写这个名字, 插件默认会生成 service-worker.js 这个文件,然后不知道WHO又生成了一次service-worker.js这个文件(内容不是workbox预期), 所以webpack生成的workbox的脚本就这样被替换了! 导致插件配置好的文件其实没被写出!!!

        //     // 当我们每次访问网站时都会去下载这个文件，当发现文件不一致时，就会安装这个新 Service Worker ，安装成功后，它将进入等待阶段。

        //     // importWorkboxFrom: 'cdn', 
        //     /* 
        //     importWorkboxFrom 可填`cdn`,`local`,`disabled`
        //         cdn: 引入google的官方cdn, 后果是国内用户打开网站, 一脸懵逼的被墙 (所以肯定不能用这个默认值!!!)
        //         local: workbox人性化的在本地写出了workbox的代码, 然后和项目代码一起上传部署就ok, 但每个项目都要这样, 就很麻烦。
        //         disabled: 傲娇的不从谷歌引入, 也不导出的本地。但如果你不配置: importScripts 的引入地址, 那将一脸懵逼。 
        //     */
        //     // importScripts: ['your workbox cdn path'], // importWorkboxFrom = disabled 有效

        //     // 这三个都写true
        //     skipWaiting: true, // 新 Service Worker 安装成功后需要进入等待阶段，skipWaiting: true 将使其跳过等待，安装成功后立即接管网站。
        //     clientsClaim: true, // 立即接管
        //     offlineGoogleAnalytics: true, // 离线也记录ga数据, 有网了再上报的意思。
        //     cleanupOutdatedCaches: true,  // 尝试删除老版本缓存

        //     // 缓存分为precache 和 runningCache, 打包之后的代码, 会自己加入到precache中, 所以无需再运行时配置缓存资源
        //     // 运行时缓存策略
        //     runtimeCaching: [
        //         {
        //             urlPattern: /^https:\/\/easy-mock\.com\//,
        //             handler: 'NetworkFirst',
        //             options: {
        //                 cacheName: 'cached-api',
        //                 networkTimeoutSeconds: 2,
        //                 expiration: {
        //                     maxEntries: 50,
        //                     maxAgeSeconds: 1 * 24 * 60 * 60, // 1 day
        //                 },
        //                 cacheableResponse: {
        //                     statuses: [0, 200],
        //                 },
        //             },
        //         },
        //     ],
        // }),
        // new InjectManifest({
        //     swSrc: './src/serviceworker.js',
        // })
    ],
    devServer: {
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true,
    }
};