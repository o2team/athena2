const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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

  cssLoaders.push({
    test: /\.(css|scss|sass)(\?.*)?$/,
    rules: [{
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 1,
            sourceMap
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
    }]
  })
  cssExtractPlugins.push(new MiniCssExtractPlugin({
    filename: 'css/[name].css',
    chunkFilename: 'css/[name].css'
  }))

  const plugins = [
    new CleanWebpackPlugin(path.join(appPath, outputRoot), {
      verbose: false,
      exclude: [library && library.directory ? library.directory : '']
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
    mode: 'production',
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
    plugins: plugins,
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap,
          uglifyOptions: Object.assign({}, {
            ie8: platform === 'pc'
          }, compress.js)
        })
      ],
      splitChunks: {
        name: false
      }
    }
  }
}
