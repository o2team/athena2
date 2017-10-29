const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const { isEmptyObject } = require('../util')

const { getPostcssPlugins } = require('./postcss.conf')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { sourceMap, output = {}, sourceRoot } = buildConfig
  const outputCSS = output.css || {}
  const cssLoaders = []
  const cssExtractPlugins = []
  if (outputCSS && !isEmptyObject(outputCSS)) {
    for (const key in outputCSS) {
      const extractFile = new ExtractTextPlugin(key)
      const include = (outputCSS[key] || []).map(item => path.join(appPath, sourceRoot, item))
      cssLoaders.push({
        test: /\.(css|scss|sass)(\?.*)?$/,
        include,
        loader: extractFile.extract({
          fallback: require.resolve('style-loader'),
          use: [
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                minimize: true,
                sourceMap
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
        })
      })
      cssExtractPlugins.push(extractFile)
    }
    cssLoaders.push({
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
    })
  } else {
    cssLoaders.push({
      test: /\.(css|scss|sass)(\?.*)?$/,
      loader: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: [
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              minimize: true,
              sourceMap
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
      })
    })
    cssExtractPlugins.push(new ExtractTextPlugin({
      filename: '[name].css'
    }))
  }
  return {
    devtool: 'hidden-source-map',
    module: {
      rules: [
        {
          oneOf: [
            ...cssLoaders
          ]
        }
      ]
    },
    resolve: {
      mainFields: ['main']
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: false,
          keep_fnames: true,
          properties: false,
          keep_quoted: true
        },
        compress: {
          warnings: false,
          screw_ie8: false,
          properties: false
        },
        output: {
          keep_quoted_props: true
        },
        comments: false,
        sourceMap
      }),
      ...cssExtractPlugins,
      new ManifestPlugin({
        fileName: 'asset-manifest.json'
      })
    ]
  }
}
