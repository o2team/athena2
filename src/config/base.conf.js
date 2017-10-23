const path = require('path')
const webpack = require('webpack')

const { getPostcssPlugins } = require('./postcss.conf')
const Util = require('../util')
const browserList = require('./browser_list')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { env = {}, defineConstants = {}, staticDirectory } = buildConfig
  return {
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.js|jsx$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: true,
                    presets: [
                      [require('babel-preset-env'), {
                        targets: {
                          browsers: browserList[platform],
                          uglify: true,
                          loose: false,
                          useBuiltIns: true
                        }
                      }]
                    ],
                    plugins: [
                      require('babel-plugin-transform-class-properties'),
                      require('babel-plugin-transform-object-rest-spread'),
                      require('babel-plugin-syntax-dynamic-import')
                    ].concat(
                      platform === 'pc' ? [
                        require('babel-plugin-transform-es3-member-expression-literals'),
                        require('babel-plugin-transform-es3-property-literals')
                      ] : []
                    ).concat(
                      framework === 'nerv' ? [
                        [require('babel-plugin-transform-react-jsx'), {
                          pragma: 'Nerv.createElement'
                        }]
                      ] : []
                    ).concat(
                      framework === 'react' ? [
                        [require('babel-plugin-transform-react-jsx')]
                      ] : []
                    )
                  }
                },
                framework === 'react' ? {
                  loader: require.resolve('hot-module-accept')
                } : {}
              ]
            },
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
                {
                  loader: require.resolve('style-loader')
                },
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
                {
                  loader: require.resolve('sass-loader')
                }
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
    resolve: {
      modules: [path.join(Util.getRootPath(), 'node_modules'), 'node_modules'],
      alias: {
        '@APP': appPath
      }
    },
    resolveLoader: {
      modules: [path.join(Util.getRootPath(), 'node_modules'), 'node_modules']
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        htmlLoader: {
          attrs: ['img:src', 'link:href', 'data-src']
        }
      }),
      new webpack.DefinePlugin(Object.assign({
        'process.env': env
      }, defineConstants))
    ]
  }
}
