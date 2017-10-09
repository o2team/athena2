// const path = require('path')
const webpack = require('webpack')
const NpmInstallPlugin = require('npm-install-webpack-plugin')

const { getPostcssPlugins } = require('./postcss.conf')

const { shouldUseCnpm } = require('../util')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { staticDirectory } = buildConfig
  return {
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.html$/,
              exclude: /page/,
              loader: require.resolve('html-loader')
            },
            {
              test: /\.vue$/,
              loader: require.resolve('vue-loader')
            },
            {
              test: /\.(png|jpe?g|gif|bpm|svg)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: `${staticDirectory}/images/[name].[ext]`
              }
            },
            {
              test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: `${staticDirectory}/media/[name].[ext]`
              }
            },
            {
              test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: `${staticDirectory}/fonts/[name].[ext]`
              }
            },
            {
              test: /\.(css|scss|sass)(\?.*)?$/,
              use: [
                require.resolve('style-loader'),
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1
                  }
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss',
                    plugins: () => getPostcssPlugins(buildConfig)
                  }
                },
                require.resolve('sass-loader')
              ]
            },
            {
              exclude: /\.js|\.html|\.json|\.ejs$/,
              loader: require.resolve('url-loader'),
              options: {
                name: `${staticDirectory}/ext/[name].[ext]`
              }
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
