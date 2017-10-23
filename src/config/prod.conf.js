const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const { getPostcssPlugins } = require('./postcss.conf')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { sourceMap } = buildConfig
  return {
    devtool: 'hidden-source-map',
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(css|scss|sass)(\?.*)?$/,
              loader: ExtractTextPlugin.extract({
                use: [
                  require.resolve('style-loader'),
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
            }
          ]
        },
        platform === 'pc' ? {
          enforce: 'post',
          test: /\.js|jsx$/,
          loader: require.resolve('es3ify-loader')
        } : {}
      ]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        compress: {
          warnings: false,
          comparisons: false
        },
        mangle: {
          screw_ie8: false,
          keep_fnames: true,
          properties: false,
          keep_quoted: true
        },
        output: {
          comments: false,
          ascii_only: true,
          keep_quoted_props: true
        },
        comments: false,
        sourceMap
      }),
      new ExtractTextPlugin({
        filename: '[name].css'
      }),
      new ManifestPlugin({
        fileName: 'asset-manifest.json'
      })
    ]
  }
}
