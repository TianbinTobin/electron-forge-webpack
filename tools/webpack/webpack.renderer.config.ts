import path from 'node:path';

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/webpack';
import { VueLoaderPlugin } from 'vue-loader';
import type { Configuration } from 'webpack';

import { plugins } from './common/webpack.plugins';
import { rules } from './common/webpack.rules';

export const rendererConfig: Configuration = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: 'babel-loader', // babel-loader去解析js文件
      },
      {
        test: /.vue$/, // 匹配.vue文件
        use: 'vue-loader', // 用vue-loader去解析vue文件
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.scss$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
      },
      {
        test: /\.(jpe?g|svg|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    ...plugins,
    new VueLoaderPlugin(),
    VueI18nPlugin({
      include: [path.join(process.cwd(), './src/renderer/locales/**')],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.vue'],
  },
  devtool: 'source-map',
};
