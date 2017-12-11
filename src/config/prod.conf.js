const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const _ = require('lodash')

const { isEmptyObject } = require('../util')

const { getPostcssPlugins } = require('./postcss.conf')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { sourceMap, output = {}, sourceRoot, outputRoot, staticDirectory } = buildConfig
  const outputCSS = output.css || {}
  const cssLoaders = []
  const cssExtractPlugins = []
  const devtool = template === 'h5' ? '' : 'hidden-source-map'
  let imgName = template === 'h5' ? 'img/[name].[ext]' : `${staticDirectory}/images/[name].[ext]`
  let imgLoaders = [{
    loader: require.resolve('url-loader'),
    options: {
      limit: 2000,
      name: imgName
    }
  }]
  template === 'h5' && buildConfig.module.imageMin.enable && imgLoaders.push({
    loader: 'image-webpack-loader',
    options: _.merge({
      mozjpeg: {
        quality: 65
      },
      pngquant: {
        quality: '55-70',
        speed: 4
      },
      svgo: {
        plugins: [{
          removeViewBox: false
        }, {
          removeEmptyAttrs: false
        }]
      },
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7,
        interlaced: false
      }
    }, buildConfig.module.imageMin)
  })

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
      filename: 'css/[name].css'
    }))
  }

  const plugins = [
    new CleanWebpackPlugin(path.join(appPath, outputRoot), {
      allowExternal: true,
      verbose: false
    }),
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
  ]

  if (template !== 'h5') {
    plugins.push(
      new ManifestPlugin({
        fileName: 'asset-manifest.json'
      }))
  }
  return {
    devtool: devtool,
    module: {
      rules: [
        {
          oneOf: [
            ...cssLoaders,
            {
              test: /\.(png|jpe?g|gif|bpm|svg)(\?.*)?$/,
              use: imgLoaders
            }
          ]
        }
      ]
    },
    resolve: {
      mainFields: ['main']
    },
    plugins: plugins
  }
}
