import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';

import { plugins } from './common/webpack.plugins';
import { rules } from './common/webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  plugins: [
    ...plugins,
    new CopyPlugin({
      patterns: [{ from: 'assets/icons/', to: '../assets/icons/' }],
    }),
  ],
  optimization: {
    nodeEnv: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // We don't want to minimize the files
        exclude: /static/,
      }),
    ],
  },
};
