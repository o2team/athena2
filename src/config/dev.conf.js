const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const autoprefixerConf = require('./autoprefixer.conf')

module.exports = function (appPath, template, platform, framework) {
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
              test: /\.bmp|\.gif|\.jpe?g|\.png$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]'
              }
            },
            {
              test: /\.css|\.scss|\.sass$/,
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
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash:8].[ext]'
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
