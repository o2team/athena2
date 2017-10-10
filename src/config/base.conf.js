const path = require('path')
const webpack = require('webpack')

const Util = require('../util')

const browserList = require('./browser_list')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { env = {}, defineConstants = {} } = buildConfig
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
                  loader: 'babel-loader',
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
                  loader: 'hot-module-accept'
                } : {}
              ]
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
      new webpack.DefinePlugin(Object.assign({
        'process.env': env
      }, defineConstants))
    ]
  }
}
