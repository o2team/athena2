const config = {
  // source files root directory
  sourceRoot: 'src',
  // output files root directory
  outputRoot: 'dist',
  // The publicPath specifies the public URL address of the output files when referenced in a browser
  // see https://webpack.js.org/guides/public-path/
  publicPath: '/',
  // the directory contains css/js/images/fonts/media etc. files
  staticDirectory: 'static',
  // define global constants for application see https://webpack.js.org/plugins/define-plugin/
  defineConstants: {
  },
  // support functions
  module: {
    postcss: {
      // autoprefixer plugin config
      autoprefixer: {
        enable: true
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
