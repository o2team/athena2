const path = require('path')
const webpack = require('webpack')

module.exports = function (contextPath, buildConfig, libConfig) {
  const { env = {}, defineConstants = {} } = buildConfig
  const name = libConfig.name || '[name].[hash:6]'
  return {
    entry: {
      vendor: libConfig.libs
    },
    module: {
      rules: [
        {
          enforce: 'post',
          test: /\.js|jsx$/,
          loader: require.resolve('es3ify-loader')
        }
      ]
    },
    resolve: {
      mainFields: ['main']
    },
    output: {
      path: contextPath,
      filename: `${name}.dll.js`,
      library: `${name}_library`
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
        comments: false
      }),
      new webpack.DefinePlugin(Object.assign({
        'process.env': env
      }, defineConstants)),

      new webpack.DllPlugin({
        path: path.join(contextPath, `${name}-manifest.json`),
        name: `${name}_library`,
        context: contextPath
      })
    ]
  }
}
