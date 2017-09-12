const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

module.exports = function () {
  return {
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.html$/,
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
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9'
                        ],
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
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
}
