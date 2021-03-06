import webpack from 'webpack';
import path from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
import autoprefixer from 'autoprefixer';

import entry from './entry';
import { fileHash } from './utils';

const env = process.env.NODE_ENV;
const isDevEnv = env === 'local';
const ROOT_PATH = path.join(__dirname, '..');
const RELATIVE_NODE_PATH = 'node_modules';
const NODE_PATH = path.join(ROOT_PATH, 'node_modules');
const PUBLIC_PATH = path.join(ROOT_PATH, 'public/');

// pugins
const assetsPlugin = new AssetsWebpackPlugin({ path: PUBLIC_PATH });
const defineEnvPlugin = new webpack.DefinePlugin({
    'process.env': { NODE_ENV: JSON.stringify(isDevEnv ? 'development' : 'production') },
});
const cleanPlugin = new CleanWebpackPlugin(PUBLIC_PATH, { root: ROOT_PATH });
const hmrPlugin = new webpack.HotModuleReplacementPlugin();

const plugins = [
    assetsPlugin,
    defineEnvPlugin,
    cleanPlugin,
];

if (isDevEnv) {
    plugins.push(hmrPlugin);
}

// loader
const reactLoader = {
    test: /\.js$/,
    exclude: /node_modules/,
    use: isDevEnv ? ['babel-loader'] : ['cache-loader', 'babel-loader'],
};

const postcssLoader = {
    loader: 'postcss-loader',
    options: {
        plugins: () => [autoprefixer({ config: './browserslist' })],
    },
};

const cssLoader = {
    test: /\.css$/,
    exclude: /node_modules/,
    use: ['style-loader', 'css-loader?modules', postcssLoader]
};

const commonCssLoader = {
    test: /\.css$/,
    include: /node_modules/,
    use: ['style-loader', 'css-loader']
};

const imageLoader = {
    test: /\.(png|svg|jpg)$/,
    loader: 'url-loader',
    include: path.resolve('images'),
    options: {
        limit: 5000,
        name: '[path][sha512:hash:base64:16].[ext]',
    },
};

const webpackConfig = [
    {
        mode: isDevEnv ? 'development' : 'production',
        entry,
        output: {
            path: PUBLIC_PATH,
            filename: fileHash('[name].js'),
            publicPath: PUBLIC_PATH,
        },
        plugins,
        module: {
            rules: [reactLoader, cssLoader, commonCssLoader, imageLoader]
        },
        resolve: {
            modules: [
                ROOT_PATH,
                RELATIVE_NODE_PATH,
                NODE_PATH
            ],
        },
        resolveLoader: {
            modules: [
                NODE_PATH,
            ],
        },
        devtool: isDevEnv ? '#eval' : false,
    }
];

webpackConfig.devServer = {
    stats: 'minimal',
    hot: true,
    publicPath: PUBLIC_PATH,
    disableHostCheck: true,
};

export default webpackConfig;
