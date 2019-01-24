const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = function (contextPath, buildConfig, libConfig, platform) {
  const { defineConstants = {}, sourceMap } = buildConfig
  const entry = {}
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
    js: defaultJSCompressConf
  }, buildConfig.module.compress)

  if (libConfig instanceof Array) {
    libConfig.forEach((lib, idx) => {
      entry[lib.name] = lib.libs
    })
  } else {
    const name = libConfig.name || 'vendor'
    entry[name] = libConfig.libs
  }

  return {
    mode: 'production',
    entry,
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
      filename: `[name].dll.js`,
      library: `$[name]_library`
    },
    plugins: [
      new webpack.DefinePlugin(defineConstants),

      new webpack.DllPlugin({
        path: path.join(contextPath, `[name]-manifest.json`),
        name: `[name]_library`,
        context: contextPath
      })
    ],
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
      ]
    }
  }
}
