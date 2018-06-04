const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const { isEmptyObject } = require('../util')

const { getPostcssPlugins } = require('./postcss.conf')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { sourceMap, output = {}, sourceRoot, outputRoot, library } = buildConfig
  const outputCSS = output.css || {}
  const cssLoaders = []
  const cssExtractPlugins = []
  const devtool = template === 'h5' ? '' : 'hidden-source-map'
  const imgLoaders = []
  buildConfig.module = buildConfig.module || {}
  const defaultCSSCompressConf = {
    mergeRules: false,
    mergeIdents: false,
    reduceIdents: false,
    discardUnused: false,
    minifySelectors: false
  }
  const defaultJSCompressConf = {
    keep_fnames: true,
    output: {
      comments: false,
      keep_quoted_props: true,
      quote_keys: true,
      beautify: false
    },
    warnings: false
  }
  const compress = Object.assign({}, {
    css: defaultCSSCompressConf,
    js: defaultJSCompressConf
  }, buildConfig.module.compress)

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
                importLoaders: 2,
                localIdentName:'[hash:base64:5]',
                modules: true,
                minimize: true
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
            importLoaders: 2,
            localIdentName:'[hash:base64:5]',
            modules: true
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
              importLoaders: 2,
              modules: true,
              minimize: compress.css,
              localIdentName:'[hash:base64:5]'
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
      })
    })
    cssExtractPlugins.push(new ExtractTextPlugin({
      filename: 'css/[name].[hash:6].css'
    }))
  }

  const plugins = [
    new CleanWebpackPlugin(path.join(appPath, outputRoot), {
      verbose: false,
      exclude: [library && library.directory ? library.directory : '']
    }),
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap,
      uglifyOptions: Object.assign({}, {
        ie8: platform === 'pc'
      }, compress.js)
    }),
    ...cssExtractPlugins
  ]

  if (template !== 'h5') {
    plugins.push(
      new ManifestPlugin({
        fileName: 'asset-manifest.json'
      })
    )
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
