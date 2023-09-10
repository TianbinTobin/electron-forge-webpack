import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { DefinePlugin } from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function transformBoolean(variable?: boolean | string) {
  if (typeof variable === 'boolean') {
    return !!variable;
  } else if (typeof variable === 'string') {
    return variable === 'true';
  } else {
    return Boolean(variable);
  }
}

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new DefinePlugin({
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    'process.env.DEFINE_PKG_BUILD_TIME': JSON.stringify(new Date().toLocaleString()),
    'process.env.DEFINE_APP_DOMAIN': JSON.stringify(process.env.DEFINE_APP_DOMAIN),
    'process.env.DEFINE_APP_API_ENV': JSON.stringify(process.env.DEFINE_APP_API_ENV),
    'process.env.DEFINE_BUILD_EDITION': JSON.stringify(process.env.DEFINE_BUILD_EDITION),
    'process.env.DEFINE_ENABLE_DEVTOOLS': JSON.stringify(transformBoolean(process.env.DEFINE_ENABLE_DEVTOOLS)),
    'process.env.DEFINE_ENABLE_AUTO_UPDATER': JSON.stringify(transformBoolean(process.env.DEFINE_ENABLE_AUTO_UPDATER)),
  }),
];
