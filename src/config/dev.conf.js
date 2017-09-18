const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const autoprefixerConf = require('./autoprefixer.conf')

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
              test: /\.(png|jpe?g|gif|bpm|svg)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: path.join(staticDirectory, 'images/[name].[ext]')
              }
            },
            {
              test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: path.join(staticDirectory, 'media/[name].[ext]')
              }
            },
            {
              test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: path.join(staticDirectory, 'fonts/[name].[ext]')
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
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      autoprefixer({
                        browsers: autoprefixerConf[platform],
                        flexbox: 'no-2009'
                      })
                    ]
                  }
                },
                require.resolve('sass-loader')
              ]
            },
            {
              exclude: /\.js|\.html|\.json|\.ejs$/,
              loader: require.resolve('url-loader'),
              options: {
                name: path.join(staticDirectory, 'ext/[name].[ext]')
              }
            }
          ]
        }
      ]
    },
    plugins: [
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
