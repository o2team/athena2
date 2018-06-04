const webpack = require('webpack')
const NpmInstallPlugin = require('npm-install-webpack-plugin')

const { getPostcssPlugins } = require('./postcss.conf')
const { shouldUseCnpm } = require('../util')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  return {
    devtool: 'cheap-module-eval-source-map',
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(css|scss|sass)(\?.*)?$/,
              use: [
                require.resolve('style-loader'),
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 2,
                    modules: true,
                    localIdentName:'[name]_[local]_[hash:base64:5]'
                  }
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss',
                    plugins: () => getPostcssPlugins(buildConfig, platform, template)
                  }
                },
                require.resolve('sass-loader')
              ]
            }
          ]
        }
      ]
    },
    plugins: [
      new NpmInstallPlugin({
        dev: false,
        peerDependencies: true,
        quiet: false,
        npm: shouldUseCnpm() ? 'cnpm' : 'npm'
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
}
