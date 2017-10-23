// const path = require('path')
const webpack = require('webpack')
const NpmInstallPlugin = require('npm-install-webpack-plugin')

const { shouldUseCnpm } = require('../util')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  return {
    devtool: 'cheap-module-eval-source-map',
    plugins: [
      new NpmInstallPlugin({
        dev: false,
        peerDependencies: true,
        quiet: false,
        npm: shouldUseCnpm() ? 'cnpm' : 'npm'
      }),
      new webpack.LoaderOptionsPlugin({
        htmlLoader: {
          attrs: ['img:src', 'link:href', 'data-src']
        }
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
}
